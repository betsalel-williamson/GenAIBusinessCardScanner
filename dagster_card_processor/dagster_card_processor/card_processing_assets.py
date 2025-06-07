import os
import json
from datetime import datetime, timezone
from urllib.parse import quote
from dagster import asset, AssetExecutionContext, MetadataValue, RetryPolicy
from .config import BatchAssetConfig  # Import shared config
from .resources import GeminiResource
from .schema_assets import response_schema_json


@asset(deps=[response_schema_json], retry_policy=RetryPolicy(max_retries=3, delay=10))
def per_batch_card_data_json(
    context: AssetExecutionContext,
    config: BatchAssetConfig,
    gemini: GeminiResource,
) -> None:
    now_utc = datetime.now(timezone.utc)
    date_imported_str = now_utc.strftime("%Y-%m-%d")
    time_imported_str = now_utc.strftime("%H:%M:%SZ")

    schema_path = os.path.join(config.output_dir, "response_schema.json")
    with open(schema_path, "r") as f:
        ai_schema = json.load(f)

    pdf_paths = [
        os.path.join(config.input_dir, fname) for fname in config.pdf_filenames
    ]
    context.log.info(
        f"Processing batch of {len(pdf_paths)} cards for run {context.run_id}."
    )

    # The AI now returns a single object: {"file_extractions": [...]}
    response_object = gemini.process_pdf_batch(pdf_paths, schema=ai_schema)
    output_path = os.path.join(config.output_dir, f"json_dump_batch_{context.run_id}.json")
    with open(output_path, "w", encoding="utf-8") as fp:
        context.add_output_metadata(
            {
                "response_object": MetadataValue.json(json.dump(response_object, fp)),
            }
        )


    # --- UPDATED PARSING LOGIC ---
    final_results = []
    per_card_metadata = {}

    # Safely get the list of file objects from the response
    file_extractions = (response_object or {}).get("file_extractions", [])

    for file_object in file_extractions:
        source_filename = file_object.get("filename")
        cards_from_file = file_object.get("cards", [])

        if not source_filename:
            context.log.warning("Found a result object from AI with no filename.")
            continue

        for card_data in cards_from_file:
            # Inject all system-managed data
            card_data["source"] = source_filename
            card_data["date_imported"] = date_imported_str
            card_data["time_imported"] = time_imported_str

            final_results.append(card_data)

            # Generate metadata for this card
            encoded_filename = quote(source_filename)
            pdf_url = f"{config.pdf_base_url}/{config.input_dir}/{encoded_filename}"
            company_name = card_data.get("Company", "Unknown Company")
            metadata_label = f"Card: {company_name} ({source_filename})"
            markdown_content = (
                f"### {company_name}\n"
                f"**[View Source PDF]({pdf_url})**\n\n"
                f"```json\n{json.dumps(card_data, indent=2)}\n```"
            )
            per_card_metadata[metadata_label] = MetadataValue.md(markdown_content)

    output_path = os.path.join(config.output_dir, f"batch_{context.run_id}.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(final_results, f, ensure_ascii=False, indent=2)

    context.log.info(f"Batch results saved to {output_path}")

    context.add_output_metadata(
        {
            "num_records": len(final_results),
            "processed_files": MetadataValue.json(config.pdf_filenames),
            "batch_output_path": output_path,
            **per_card_metadata,
        }
    )
