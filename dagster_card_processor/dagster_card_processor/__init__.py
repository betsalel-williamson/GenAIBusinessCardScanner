import os
from dotenv import load_dotenv
from dagster import Definitions
from .dbt_assets import dbt_card_processor_assets, dbt_resource
from .schema_assets import response_schema_json

# --- IMPORT THE NEW ASSET ---
from .card_processing_assets import per_batch_card_data_json, aggregated_results_json, validated_cards_data
from .resources import GeminiResource
from .sensors import pdf_files_sensor

load_dotenv()

# --- UPDATE THE ASSET LIST ---
all_assets = [
    dbt_card_processor_assets,
    response_schema_json,
    per_batch_card_data_json,
    aggregated_results_json,
    validated_cards_data,
]

all_resources = {
    "dbt": dbt_resource,
    "gemini": GeminiResource(
        api_key=os.getenv("GOOGLE_API_KEY"),
        model_name=os.getenv("MODEL_NAME"),
        pdf_base_url=os.getenv("PDF_BASE_URL"),
    ),
}

defs = Definitions(
    assets=all_assets,
    resources=all_resources,
    sensors=[pdf_files_sensor],
)
