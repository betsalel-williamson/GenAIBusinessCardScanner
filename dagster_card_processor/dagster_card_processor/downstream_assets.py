import os
import json
from datetime import datetime, timezone
from dagster import asset, AssetExecutionContext, MetadataValue
from dagster_dbt import DbtCliResource # Import the resource here
from .config import FileConfig
from .card_processing_assets import processed_card_json

@asset(deps=[processed_card_json])
def aggregated_results_json(context: AssetExecutionContext, config: FileConfig) -> None:
    # ... (This asset is correct and remains the same) ...
    output_dir = config.output_dir
    all_results = []
    batch_files = [f for f in os.listdir(output_dir) if f.startswith("batch_") and f.endswith(".json")]
    context.log.info(f"Found {len(batch_files)} batch files to aggregate.")
    for filename in batch_files:
        with open(os.path.join(output_dir, filename), "r") as f:
            batch_data = json.load(f)
            all_results.extend(batch_data)
    final_output_path = os.path.join(output_dir, "results.json")
    with open(final_output_path, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
    context.log.info(f"Aggregated results saved to {final_output_path}")
    context.add_output_metadata({
        "total_records": len(all_results),
        "total_batches": len(batch_files),
        "output_path": final_output_path
    })

@asset(deps=[aggregated_results_json])
def validated_cards_data(context: AssetExecutionContext, config: FileConfig) -> str:
    """
    This asset represents the human validation step. It returns the path
    to the approved file for the downstream asset to use.
    """
    validated_file_path = os.path.join(config.output_dir, "results.json")
    context.log.info(f"Human validation signal received for file: {validated_file_path}")
    context.add_output_metadata({
        "validated_file": validated_file_path,
        "validated_at": datetime.now(timezone.utc).isoformat()
    })
    return validated_file_path
