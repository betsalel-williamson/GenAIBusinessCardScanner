import os
import json
from dagster import asset, AssetExecutionContext, Config, AssetKey
from .dbt_assets import dbt_manifest_path


class AssetConfig(Config):
    output_dir: str = os.getenv("OUTPUT_DIR", "output")
    system_injected_prefix: str = os.getenv(
        "SYSTEM_INJECTED_PREFIX", "[SYSTEM-INJECTED]"
    )


@asset(deps=[AssetKey(("dbt_card_processor_assets", "stg_cards_data"))])
def response_schema_json(context: AssetExecutionContext, config: AssetConfig) -> dict:
    """
    Parses the dbt manifest to generate a JSON schema for the Gemini model.
    The schema defines an array of objects, where each object contains a filename and a list of cards.
    """
    with open(dbt_manifest_path) as f:
        manifest = json.load(f)

    model_node = manifest["nodes"]["model.dbt_card_processor.stg_cards_data"]

    SYSTEM_INJECTED_PREFIX = config.system_injected_prefix

    business_card_properties = {}
    for col_name, col_def in model_node["columns"].items():
        description = col_def.get("description", "")
        if not description.strip().startswith(SYSTEM_INJECTED_PREFIX):
            business_card_properties[col_name] = {
                "type": "string",
                "description": description,
            }

    # --- THIS IS THE NEW SCHEMA STRUCTURE ---
    schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "Batched Card Extraction Response",
        "description": "An array of objects, where each object represents a file and its extracted cards.",
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "filename": {
                    "type": "string",
                    "description": "The name of the source PDF file.",
                },
                "cards": {
                    "type": "array",
                    "description": "A list of business card objects extracted from this file.",
                    "items": {"type": "object", "properties": business_card_properties},
                },
            },
        },
    }

    output_path = os.path.join(config.output_dir, "response_schema.json")
    with open(output_path, "w") as f:
        json.dump(schema, f, indent=2)

    context.log.info(f"Generated response schema from DBT manifest at {output_path}")
    return schema
