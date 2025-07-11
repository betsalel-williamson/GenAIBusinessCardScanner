from dagster import Config, asset, AssetExecutionContext, MetadataValue
from .resources import DuckDBResource


class FinalizationConfig(Config):
    """Configuration for the finalization assets."""

    record_id: int


@asset
def mark_as_processed(
    context: AssetExecutionContext,
    config: FinalizationConfig,
    duckdb_resource: DuckDBResource,
) -> None:
    """
    Updates the status of a record from 'validated' to 'processed' in the database.
    This asset is the final step in the finalization pipeline for a single record.
    """
    record_id = config.record_id
    with duckdb_resource.get_connection() as con:
        # Check current status to ensure we are not processing an already processed record
        current_status_result = con.execute(
            "SELECT status, filename FROM records WHERE id = ?", [record_id]
        ).fetchone()

        if not current_status_result:
            context.log.warning(f"Record with ID {record_id} not found. Skipping.")
            return

        current_status, filename = current_status_result
        if current_status != "validated":
            context.log.warning(
                f"Record '{filename}' (ID: {record_id}) has status '{current_status}', not 'validated'. Skipping."
            )
            return

        # Update the status to 'processed'
        con.execute("UPDATE records SET status = 'processed' WHERE id = ?", [record_id])
        context.log.info(f"Marked record '{filename}' (ID: {record_id}) as processed.")

        context.add_output_metadata(
            {
                "record_id": record_id,
                "filename": filename,
                "final_status": "processed",
                "message": MetadataValue.text(
                    f"Successfully finalized record {record_id} ('{filename}')."
                ),
            }
        )
