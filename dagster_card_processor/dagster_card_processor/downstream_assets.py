import os
import json
from datetime import datetime, timezone
from dagster import asset, AssetExecutionContext, MetadataValue
from dagster_dbt import DbtCliResource
from .config import FileConfig
from .card_processing_assets import processed_card_json

@asset(deps=[processed_card_json])
def aggregated_results_json(context: AssetExecutionContext, config: FileConfig) -> None:
    # ... (This asset remains the same) ...
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

# --- THIS ASSET IS UPDATED ---
@asset(deps=[aggregated_results_json])
def validated_cards_data(context: AssetExecutionContext, config: FileConfig) -> None:
    """
    This asset represents the human validation step. It doesn't produce a data output,
    but its materialization acts as a signal of approval for the downstream DBT load.
    """
    validated_file_path = os.path.join(config.output_dir, "results.json")
    context.log.info(f"Human validation signal received for file: {validated_file_path}")
    context.add_output_metadata({
        "validated_file": validated_file_path,
        "validated_at": datetime.now(timezone.utc).isoformat()
    })
    # This asset no longer needs to return anything. Its successful completion is the signal.

# --- THIS ASSET IS UPDATED ---
@asset(deps=[validated_cards_data])
def load_validated_data_to_duckdb(
    context: AssetExecutionContext,
    dbt: DbtCliResource,
    config: FileConfig # It gets the config directly, not from the upstream asset
) -> None:
    """
    Executes the dbt model to load the validated JSON data into DuckDB.
    It knows where to find the file based on its own configuration.
    """
    # The path to the validated JSON file is constructed from the config.
    json_path = os.path.join(config.output_dir, "results.json")

    context.log.info(f"Loading data from {json_path} into DuckDB via DBT.")

    dbt_vars = {"validated_json_path": json_path}

    dbt_run_result = dbt.cli(
        ["run", "--select", "stg_cards_data", "--vars", json.dumps(dbt_vars)],
        context=context
    ).wait()

    context.add_output_metadata({
        "dbt_run_results": dbt_run_result.get_artifact("run_results.json")
    })
