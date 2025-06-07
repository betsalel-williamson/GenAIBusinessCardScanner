import os
import json
from dagster import sensor, SensorEvaluationContext, SensorResult, RunRequest
from .partitions import pdf_partitions # <-- Import from the new location
from .config import FileConfig # <-- Import the shared config

@sensor(job_name="process_all_assets")
def pdf_files_sensor(context: SensorEvaluationContext):
    """
    A sensor that checks for new PDF files and creates a partition and a run request for each one.
    """
    # Use the centralized config to get the input directory
    config = FileConfig()
    input_dir = config.input_dir

    if not os.path.isdir(input_dir):
        return

    current_files = {f for f in os.listdir(input_dir) if f.lower().endswith('.pdf')}
    last_processed_files = set(json.loads(context.cursor)) if context.cursor else set()
    new_files = sorted(list(current_files - last_processed_files))

    if not new_files:
        return

    run_requests = [
        RunRequest(run_key=filename, partition_key=filename)
        for filename in new_files
    ]

    new_partitions_request = pdf_partitions.build_add_request(list(new_files))

    context.update_cursor(json.dumps(list(current_files)))

    return SensorResult(
        run_requests=run_requests,
        dynamic_partitions_requests=[new_partitions_request]
    )