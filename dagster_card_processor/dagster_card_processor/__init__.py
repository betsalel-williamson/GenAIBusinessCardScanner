import os
from dagster_dbt import DbtCliResource
from dotenv import load_dotenv
from dagster import Definitions, define_asset_job
from .dbt_assets import aggregated_results_json_to_db, dbt_card_processor_assets
from .schema_assets import response_schema_json
from .card_processing_assets import (
    processed_card_json,
)
from .resources import GeminiResource
from .sensors import pdf_files_sensor
from .project import business_card_project

load_dotenv()

all_assets = [
    dbt_card_processor_assets,
    aggregated_results_json_to_db,
    response_schema_json,
    processed_card_json,
]

# Define a job that materializes all assets
process_all_assets_job = define_asset_job(
    name="process_all_assets", selection=all_assets
)

all_resources = {
    "dbt": DbtCliResource(project_dir=business_card_project),
    "gemini": GeminiResource(
        api_key=os.getenv("GOOGLE_API_KEY"), model_name=os.getenv("MODEL_NAME")
    ),
}

all_sensors = [pdf_files_sensor]

all_jobs = [process_all_assets_job]

defs = Definitions(
    assets=all_assets,
    resources=all_resources,
    sensors=all_sensors,
    jobs=all_jobs,
)
