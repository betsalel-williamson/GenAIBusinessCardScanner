import os
import json
from datetime import datetime, timezone
from dagster import asset, AssetExecutionContext, MetadataValue
from .config import BatchAssetConfig  # Import shared config
from .card_processing_assets import per_batch_card_data_json  # Import upstream asset


@asset(deps=[per_batch_card_data_json])
def aggregated_results_json(
    context: AssetExecutionContext, config: BatchAssetConfig
) -> None:
    """
    Scans the output directory for all batch files and aggregates them into a single results.json file.
    """
    output_dir = config.output_dir
    all_results = []
    batch_files = [
        f
        for f in os.listdir(output_dir)
        if f.startswith("batch_") and f.endswith(".json")
    ]

    context.log.info(f"Found {len(batch_files)} batch files to aggregate.")

    for filename in batch_files:
        with open(os.path.join(output_dir, filename), "r") as f:
            batch_data = json.load(f)
            all_results.extend(batch_data)

    final_output_path = os.path.join(output_dir, "results.json")
    with open(final_output_path, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)

    context.log.info(f"Aggregated results saved to {final_output_path}")
    context.add_output_metadata(
        {
            "total_records": len(all_results),
            "total_batches": len(batch_files),
            "output_path": final_output_path,
        }
    )


@asset(deps=[aggregated_results_json])
def validated_cards_data(
    context: AssetExecutionContext, config: BatchAssetConfig
) -> None:
    """
    This asset represents the human validation step. It promotes the aggregated data to a validated state.
    """
    source_path = os.path.join(config.output_dir, "results.json")
    validated_dir = os.path.join(config.output_dir, "validated")
    os.makedirs(validated_dir, exist_ok=True)

    validation_ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    destination_path = os.path.join(
        validated_dir, f"validated_results_{validation_ts}.json"
    )

    with open(source_path, "r") as f_in, open(destination_path, "w") as f_out:
        data = json.load(f_in)
        json.dump(data, f_out, indent=2)

    context.log.info(
        f"Human validation signal received. Promoted data to {destination_path}"
    )
    context.add_output_metadata(
        {
            "validated_records": len(data),
            "validated_at": validation_ts,
            "validated_output_path": destination_path,
        }
    )
