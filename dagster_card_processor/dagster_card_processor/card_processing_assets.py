import os
import json
from datetime import datetime, timezone
from urllib.parse import quote
from dagster import asset, AssetExecutionContext, MetadataValue
from .config import FileConfig # <-- Import the shared config
from .partitions import pdf_partitions # <-- Import from the new location
from .resources import GeminiResource
from .schema_assets import response_schema_json

@asset(
    partitions_def=pdf_partitions,
    deps=[response_schema_json],
)
def processed_card_json(
    context: AssetExecutionContext,
    config: FileConfig, # <-- Use the shared config class
    gemini: GeminiResource,
) -> None:
    """
    Processes a single PDF (one partition), adds system timestamps, and saves the result
    as a single JSON object to a unique file for that partition.
    """
    now_utc = datetime.now(timezone.utc)
    date_imported_str = now_utc.strftime("%Y-%m-%d")
    time_imported_str = now_utc.strftime("%H:%M:%SZ")

    schema_path = os.path.join(config.output_dir, "response_schema.json")
    with open(schema_path, "r") as f:
        ai_schema = json.load(f)

    source_filename = context.partition_key
    pdf_path = os.path.join(config.input_dir, source_filename)
    context.log.info(f"Processing file: {pdf_path}")

    # The AI now returns a single card object (dict)
    card_data = gemini.process_single_pdf(pdf_path, schema=ai_schema)

    # Check if the AI returned a valid dictionary
    if not isinstance(card_data, dict) or not card_data:
        context.log.warning(f"No valid card data returned for {source_filename}. Skipping.")
        # We can optionally yield an AssetMaterialization with failure metadata here
        return

    # Inject all system-managed data
    card_data["source"] = source_filename
    card_data["date_imported"] = date_imported_str
    card_data["time_imported"] = time_imported_str

    # Generate metadata for this card
    encoded_filename = quote(source_filename)
    pdf_url = f"{config.pdf_base_url}/{config.input_dir}/{encoded_filename}"
    company_name = card_data.get("company", "Unknown Company")
    metadata_label = f"Card: {company_name} ({source_filename})"
    markdown_content = (
        f"### {company_name}\n"
        f"**[View Source PDF]({pdf_url})**\n\n"
        f"```json\n{json.dumps(card_data, indent=2)}\n```"
    )

    # Save the single, enriched JSON object to a unique file for this partition
    output_path = os.path.join(config.output_dir, f"processed_{source_filename}.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(card_data, f, ensure_ascii=False, indent=2)

    context.log.info(f"Partition results saved to {output_path}")

    context.add_output_metadata({
        "output_path": output_path,
        metadata_label: MetadataValue.md(markdown_content)
    })
