import os
import json
from datetime import datetime, timezone
from dagster import asset, AssetExecutionContext
from .config import FileConfig
from .card_processing_assets import processed_card_json


@asset(deps=[processed_card_json])
def aggregated_results_json(context: AssetExecutionContext, config: FileConfig) -> str:
    """
    Aggregates all individual processed card JSON files into a single results.json file.
    Returns the path to the aggregated file.
    """
    output_dir = config.output_dir
    all_results = []
    # Files from processed_card_json are named like "processed_<original_filename>.json"
    processed_files = [
        f
        for f in os.listdir(output_dir)
        if f.startswith("processed_") and f.endswith(".json")
    ]
    context.log.info(f"Found {len(processed_files)} processed files to aggregate.")
    for filename in processed_files:
        with open(os.path.join(output_dir, filename), "r") as f:
            # Each processed_*.json file contains a single JSON object
            card_data = json.load(f)
            all_results.append(card_data)
    final_output_path = os.path.join(output_dir, "results.json")
    with open(final_output_path, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
    context.log.info(f"Aggregated results saved to {final_output_path}")
    context.add_output_metadata(
        {
            "total_records": len(all_results),
            "total_files_aggregated": len(processed_files),
            "output_path": final_output_path,
        }
    )
    return final_output_path
