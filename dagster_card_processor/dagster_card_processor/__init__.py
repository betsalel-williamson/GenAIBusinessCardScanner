import os
from dotenv import load_dotenv
from dagster import Definitions
from .dbt_assets import dbt_card_processor_assets, dbt_resource
from .schema_assets import response_schema_json
from .card_processing_assets import per_batch_card_data_json
from .downstream_assets import (
    aggregated_results_json,
    validated_cards_data,
)  # Import from new file
from .resources import GeminiResource
from .sensors import pdf_files_sensor

load_dotenv()

all_assets = [
    dbt_card_processor_assets,
    response_schema_json,
    per_batch_card_data_json,
    aggregated_results_json,
    validated_cards_data,
]

all_resources = {
    "dbt": dbt_resource,
    "gemini": GeminiResource(api_key=os.getenv("GOOGLE_API_KEY")),
}

defs = Definitions(
    assets=all_assets,
    resources=all_resources,
    sensors=[pdf_files_sensor],
)
