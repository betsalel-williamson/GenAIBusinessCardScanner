import json
import os
from dagster import (
    sensor,
    SensorEvaluationContext,
    SensorResult,
    RunRequest,
    AssetSelection,
)
from .card_processing_assets import pdf_partitions, AssetConfig


@sensor(asset_selection=AssetSelection.assets("processed_card_json"))
def pdf_files_sensor(context: SensorEvaluationContext):
    """
    A sensor that checks for new PDF files in the input directory and creates
    partitions and run requests for them.
    """
    # Use the default config to find the input directory.
    # In a real-world scenario, you might fetch this from a more robust config source.
    config = AssetConfig()
    input_dir = config.input_dir

    if not os.path.isdir(input_dir):
        return

    # Get the set of files currently in the directory
    current_files = {f for f in os.listdir(input_dir) if f.lower().endswith(".pdf")}

    # Get the set of partitions that Dagster already knows about from the last run
    # The cursor acts as the sensor's memory.
    last_processed_files = set(json.loads(context.cursor)) if context.cursor else set()

    # Find the new files that haven't been processed yet
    new_files = current_files - last_processed_files

    if not new_files:
        return

    # For each new file, create a run request
    run_requests = [
        RunRequest(
            run_key=filename,
            partition_key=filename,
        )
        for filename in new_files
    ]

    # Tell Dagster to add these new files as partitions
    new_partitions_request = pdf_partitions.build_add_request(list(new_files))

    # Update the cursor to the current state so we don't process these files again
    context.update_cursor(json.dumps(list(current_files)))

    return SensorResult(
        run_requests=run_requests, dynamic_partitions_requests=[new_partitions_request]
    )
