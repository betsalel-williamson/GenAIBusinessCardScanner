import os
import json
from dagster import asset, AssetExecutionContext, Config, AssetKey
from .project import business_card_project


class AssetConfig(Config):
    output_dir: str = os.getenv("OUTPUT_DIR", "output")
    system_injected_prefix: str = os.getenv(
        "SYSTEM_INJECTED_PREFIX", "[SYSTEM-INJECTED]"
    )


@asset(deps=[AssetKey(["staging", "stg_cards_data"])])
def response_schema_json(context: AssetExecutionContext, config: AssetConfig) -> dict:
    """
    Parses the dbt manifest to generate a JSON schema for a SINGLE card object.
    """
    with open(business_card_project.manifest_path) as f:
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

    schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "Business Card",
        "description": "A single extracted business card object.",
        "type": "object",
        "properties": business_card_properties,
    }

    output_path = os.path.join(config.output_dir, "response_schema.json")
    with open(output_path, "w") as f:
        json.dump(schema, f, indent=2)

    context.log.info(f"Generated response schema from DBT manifest at {output_path}")
    return schema
