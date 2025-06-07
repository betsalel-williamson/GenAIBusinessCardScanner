import os
from dotenv import load_dotenv
from dagster import Definitions, define_asset_job
from .dbt_assets import dbt_card_processor_assets, dbt_resource
from .schema_assets import response_schema_json
from .card_processing_assets import processed_card_json
from .downstream_assets import aggregated_results_json, validated_cards_data
from .resources import GeminiResource
from .sensors import pdf_files_sensor

load_dotenv()

all_assets = [
    dbt_card_processor_assets,
    response_schema_json,
    processed_card_json,
    aggregated_results_json,
    validated_cards_data,
]

# Define a job that materializes all assets
process_all_assets_job = define_asset_job(
    name="process_all_assets",
    selection=all_assets
)

all_resources = {
    "dbt": dbt_resource,
    "gemini": GeminiResource(
      api_key=os.getenv("GOOGLE_API_KEY"),
      model_name=os.getenv("MODEL_NAME")
      ),
}

defs = Definitions(
    assets=all_assets,
    resources=all_resources,
    sensors=[pdf_files_sensor],
    jobs=[process_all_assets_job], # Add the job here
)