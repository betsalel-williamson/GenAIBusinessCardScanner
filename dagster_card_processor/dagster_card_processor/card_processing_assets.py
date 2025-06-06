import os
import json
import copy
from datetime import datetime, timezone  # Import the datetime module
from dagster import asset, AssetExecutionContext, Config, MetadataValue
from .resources import GeminiResource
from .schema_assets import response_schema_json


# --- THIS CLASS IS UPDATED ---
class BatchAssetConfig(Config):
    # For string values, we can directly use os.getenv with a fallback.
    input_dir: str = os.getenv("INPUT_DIR", "cards_to_process")
    output_dir: str = os.getenv("OUTPUT_DIR", "output")

    # For integer values, we must cast the result of os.getenv (which is always a string).
    max_batch_size: int = int(os.getenv("MAX_BATCH_SIZE", "10"))

    pdf_base_url: str = os.getenv("PDF_BASE_URL", "http://localhost:8000")

    # This field is provided at runtime by the sensor, so it has no default.
    pdf_filenames: list[str]

@asset(deps=[response_schema_json])
def per_batch_card_data_json(
    context: AssetExecutionContext,
    config: BatchAssetConfig,
    gemini: GeminiResource,
) -> None:
    """
    Processes a batch of PDFs, adds system timestamps and source URLs, saves the result
    to a unique file, and attaches rich, per-card metadata for validation.
    """
    # Generate timestamps for the batch
    now_utc = datetime.now(timezone.utc)
    date_imported_str = now_utc.strftime("%Y-%m-%d")
    time_imported_str = now_utc.strftime("%H:%M:%SZ")

    # Load and modify the schema for the AI
    schema_path = os.path.join(config.output_dir, "response_schema.json")
    with open(schema_path, "r") as f:
        full_schema = json.load(f)
    ai_schema = copy.deepcopy(full_schema)
    ai_schema_properties = ai_schema.get("items", {}).get("properties", {})
    ai_schema_properties.pop("date_imported", None)
    ai_schema_properties.pop("time_imported", None)

    # Process the batch with the AI
    pdf_paths = [
        os.path.join(config.input_dir, fname) for fname in config.pdf_filenames
    ]
    context.log.info(
        f"Processing batch of {len(pdf_paths)} cards for run {context.run_id}."
    )
    all_results = gemini.process_pdf_batch(pdf_paths, schema=ai_schema)

    # --- NEW: POST-PROCESSING AND METADATA GENERATION ---
    per_card_metadata = {}
    for card_data in all_results:
        # Inject system-generated data
        card_data["date_imported"] = date_imported_str
        card_data["time_imported"] = time_imported_str

        # Construct the full URL to the source PDF
        source_filename = card_data.get("source")
        if source_filename:
            # The URL needs to include the input directory path
            pdf_url = f"{config.pdf_base_url}/{config.input_dir}/{source_filename}"
            card_data["source_pdf_url"] = pdf_url

            # Create a rich Markdown metadata entry for this card
            company_name = card_data.get("Company", "Unknown Company")
            metadata_label = f"Card: {company_name} ({source_filename})"

            markdown_content = (
                f"### {company_name}\n"
                f"**[View Source PDF]({pdf_url})**\n\n"
                f"```json\n{json.dumps(card_data, indent=2)}\n```"
            )
            per_card_metadata[metadata_label] = MetadataValue.md(markdown_content)

    # Save to a unique file for this batch run
    output_path = os.path.join(config.output_dir, f"batch_{context.run_id}.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)

    context.log.info(f"Batch results saved to {output_path}")

    # Attach all the per-card metadata entries to the asset materialization
    context.add_output_metadata(
        {
            "num_records": len(all_results),
            "processed_files": MetadataValue.json(config.pdf_filenames),
            "batch_output_path": output_path,
            **per_card_metadata,  # Unpack the dictionary of metadata entries
        }
    )

# --- ASSET 2: AGGREGATES ALL BATCHES ---
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


# --- ASSET 3: MANUAL VALIDATION STEP ---
@asset(deps=[aggregated_results_json])
def validated_cards_data(
    context: AssetExecutionContext, config: BatchAssetConfig
) -> None:
    """
    This asset represents the human validation step. It is intended to be materialized
    manually from the UI after a user has verified the contents of results.json.

    Its logic "promotes" the data to a validated state.
    """
    source_path = os.path.join(config.output_dir, "results.json")
    validated_dir = os.path.join(config.output_dir, "validated")
    os.makedirs(validated_dir, exist_ok=True)

    # Create a timestamped filename for the validated data
    validation_ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
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
