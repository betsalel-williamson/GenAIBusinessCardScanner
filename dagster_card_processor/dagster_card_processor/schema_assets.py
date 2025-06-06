import os
import json
from dagster import asset, AssetExecutionContext, Config, AssetKey
from .dbt_assets import dbt_manifest_path


class AssetConfig(Config):
    output_dir: str = "output"


@asset(deps=[AssetKey(("dbt_card_processor_assets", "stg_cards_data"))])
def response_schema_json(context: AssetExecutionContext, config: AssetConfig) -> None:
    """Parses the dbt manifest.json to generate the JSON schema for the Gemini model."""
    with open(dbt_manifest_path) as f:
        manifest = json.load(f)

    model_node = manifest["nodes"]["model.dbt_card_processor.stg_cards_data"]
    properties = {}
    for col_name, col_def in model_node["columns"].items():
        properties[col_name] = {
            "type": "string",
            "description": col_def.get("description", "No description available."),
        }

    schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "array",
        "items": {"type": "object", "properties": properties},
    }

    output_path = os.path.join(config.output_dir, "response_schema.json")
    with open(output_path, "w") as f:
        json.dump(schema, f, indent=2)

    context.log.info(f"Generated response schema from DBT manifest at {output_path}")
