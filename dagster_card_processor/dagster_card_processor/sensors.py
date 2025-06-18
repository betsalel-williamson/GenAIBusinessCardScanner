import os
import json
from dagster import sensor, SensorEvaluationContext, SensorResult, RunRequest
from .partitions import pdf_partitions


@sensor(job_name="process_all_assets")
def pdf_files_sensor(context: SensorEvaluationContext):
    """
    A sensor that checks for new PDF files and creates a partition and a run request for each one,
    tagging each run for concurrency control.
    """
    input_dir = "cards_to_process"
    if not os.path.isdir(input_dir):
        return

    current_files = {f for f in os.listdir(input_dir) if f.lower().endswith('.pdf')}
    last_processed_files = set(json.loads(context.cursor)) if context.cursor else set()
    new_files = sorted(list(current_files - last_processed_files))

    if not new_files:
        return

    # Define the tag that matches the rule in dagster.yaml
    concurrency_tag = {"concurrency_key": "gemini_api"}

    # Create one run request for each new file, applying the tag
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
        run_requests=run_requests,
        dynamic_partitions_requests=[new_partitions_request]
    )
