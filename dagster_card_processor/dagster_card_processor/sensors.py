import os
import json
import time  # <-- IMPORT THE TIME MODULE
from dagster import (
    sensor,
    SensorEvaluationContext,
    SensorResult,
    RunRequest,
    AssetSelection,
)
from .card_processing_assets import BatchAssetConfig


@sensor(asset_selection=AssetSelection.assets("per_batch_card_data_json"))
def pdf_files_sensor(context: SensorEvaluationContext):
    """
    A sensor that checks for new PDF files and triggers a single run for the entire batch.
    """
    config = BatchAssetConfig(pdf_filenames=[])
    input_dir = config.input_dir

    if not os.path.isdir(input_dir):
        return

    current_files = {f for f in os.listdir(input_dir) if f.lower().endswith(".pdf")}
    last_processed_files = set(json.loads(context.cursor)) if context.cursor else set()
    new_files = sorted(list(current_files - last_processed_files))

    if not new_files:
        return

    # --- THIS IS THE FIX ---
    # Generate a unique run_key using the current timestamp.
    # Using int() makes it a bit cleaner than a float.
    run_key = f"batch_{int(time.time())}"

    # The rest of the logic remains the same
    run_config = {
        "ops": {
            # --- UPDATE THE OP NAME ---
            "per_batch_card_data_json": {
                "config": {
                    "pdf_filenames": new_files,
                    "max_batch_size": config.max_batch_size,
                }
            }
        }
    }

    context.update_cursor(json.dumps(list(current_files)))

    return RunRequest(
        run_key=run_key,
        run_config=run_config,
    )
