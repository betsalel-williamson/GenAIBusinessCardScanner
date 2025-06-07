import os
import json
from datetime import datetime, timezone
# --- THIS IS THE FIX ---
# Import 'FileConfig' from our local, shared config file.
# Also import the necessary Dagster classes.
from dagster import asset, AssetExecutionContext, MetadataValue
from .config import FileConfig
from .card_processing_assets import processed_card_json

@asset(deps=[processed_card_json])
# Use the correct config class name in the type hint
def aggregated_results_json(context: AssetExecutionContext, config: FileConfig) -> None:
    """
    Scans the output directory for all processed JSON files and aggregates them into a single list.
    """
    output_dir = config.output_dir
    all_results = []
    # Update the file pattern to match the new output files
    processed_files = [f for f in os.listdir(output_dir) if f.startswith("processed_") and f.endswith(".json")]

    context.log.info(f"Found {len(processed_files)} processed files to aggregate.")

    for filename in processed_files:
        with open(os.path.join(output_dir, filename), "r") as f:
            # Each file now contains a single JSON object
            card_data = json.load(f)
            all_results.append(card_data)

    final_output_path = os.path.join(output_dir, "results.json")
    with open(final_output_path, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)

    context.log.info(f"Aggregated results saved to {final_output_path}")
    context.add_output_metadata({
        "total_records": len(all_results),
        "output_path": final_output_path
    })

@asset(deps=[aggregated_results_json])
# Use the correct config class name in the type hint
def validated_cards_data(context: AssetExecutionContext, config: FileConfig) -> None:
    """
    This asset represents the human validation step. It promotes the aggregated data to a validated state.
    """
    source_path = os.path.join(config.output_dir, "results.json")
    validated_dir = os.path.join(config.output_dir, "validated")
    os.makedirs(validated_dir, exist_ok=True)

    validation_ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    destination_path = os.path.join(validated_dir, f"validated_results_{validation_ts}.json")

    with open(source_path, "r") as f_in, open(destination_path, "w") as f_out:
        data = json.load(f_in)
        json.dump(data, f_out, indent=2)

    context.log.info(f"Human validation signal received. Promoted data to {destination_path}")
    context.add_output_metadata({
        "validated_records": len(data),
        "validated_at": validation_ts,
        "validated_output_path": destination_path
    })
