import os
import json
from dagster import (
    sensor,
    SensorEvaluationContext,
    SensorResult,
    RunRequest,
    DefaultSensorStatus,
)
from .partitions import pdf_partitions
from .defs import DuckDBResource
from .config import InputConfig
import duckdb

# SensorDbConfig is no longer needed, as we use the DuckDBResource directly.


@sensor(
    job_name="process_all_assets",
    minimum_interval_seconds=30,
    default_status=DefaultSensorStatus.RUNNING,
)
def pdf_files_sensor(context: SensorEvaluationContext):
    """
    A sensor that checks for new PDF files and creates a partition and a run request for each one,
    tagging each run for concurrency control.
    """
    # Use input_dir from FileConfig
    input_dir = InputConfig().input_dir
    if not os.path.isdir(input_dir):
        return

    current_files = {f for f in os.listdir(input_dir) if f.lower().endswith(".pdf")}
    last_processed_files = set(json.loads(context.cursor)) if context.cursor else set()
    new_files = sorted(list(current_files - last_processed_files))

    if not new_files:
        return

    concurrency_tag = {"concurrency_key": "gemini_api"}
    run_requests = [
        RunRequest(
            run_key=filename,
            partition_key=filename,
            tags=concurrency_tag,
        )
        for filename in new_files
    ]
    new_partitions_request = pdf_partitions.build_add_request(list(new_files))
    context.update_cursor(json.dumps(list(current_files)))

    return SensorResult(
        run_requests=run_requests, dynamic_partitions_requests=[new_partitions_request]
    )


@sensor(
    job_name="finalize_record_job",
    minimum_interval_seconds=30,
    default_status=DefaultSensorStatus.RUNNING,
)
def validated_records_sensor(
    context: SensorEvaluationContext, duckdb_resource: DuckDBResource
):
    """
    Polls the database for records with status 'validated' that have not yet been processed.
    Uses the record 'id' as a cursor to ensure each record is processed only once.
    This sensor now uses the DuckDBResource for consistent database access.
    """
    last_processed_id = int(context.cursor) if context.cursor else 0

    try:
        with duckdb_resource.get_connection() as con:
            new_records = con.execute(
                "SELECT id, filename FROM records WHERE status = 'validated' AND id > ? ORDER BY id ASC",
                [last_processed_id],
            ).fetchall()
    except duckdb.IOException as e:
        context.log.warning(
            f"Database connection failed: {e}. This may be expected if the DB file doesn't exist yet. Skipping sensor run."
        )
        return
    except duckdb.CatalogException:
        # This can happen if the DB file exists but the table hasn't been created yet.
        context.log.warning(
            "The 'records' table was not found. Has the main pipeline run yet? Skipping sensor run."
        )
        return

    if not new_records:
        return

    run_requests = [
        RunRequest(
            run_key=f"finalize_record_{record_id}",
            run_config={
                "ops": {"mark_as_processed": {"config": {"record_id": record_id}}}
            },
        )
        for record_id, filename in new_records
    ]

    # The framework will persist the cursor from the returned SensorResult.
    return SensorResult(run_requests=run_requests, cursor=str(new_records[-1][0]))
