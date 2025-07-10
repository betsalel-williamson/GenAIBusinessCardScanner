import os
from dagster_dbt import DbtCliResource
from dotenv import load_dotenv
from dagster import Definitions, define_asset_job, AssetSelection
from .dbt_assets import aggregated_results_json_to_db, dbt_card_processor_assets
from .schema_assets import response_schema_json
from .card_processing_assets import processed_card_json
from .finalization_assets import mark_as_processed
from .resources import GeminiResource, DuckDBResource, GoogleSheetsResource, EmailClientResource
from .postmark_email_client import PostmarkEmailClient
from .sensors import pdf_files_sensor, validated_records_sensor
from .project import business_card_project

load_dotenv()

# Define a job that materializes all assets for initial processing
process_all_assets_job = define_asset_job(
    name="process_all_assets",
    selection=AssetSelection.all() - AssetSelection.assets(mark_as_processed)
)

# Define a job for finalizing a single record
finalize_record_job = define_asset_job(
    name="finalize_record_job",
    selection=AssetSelection.assets(mark_as_processed)
)

all_assets = [
    dbt_card_processor_assets,
    aggregated_results_json_to_db,
    response_schema_json,
    processed_card_json,
    mark_as_processed,
]

all_resources = {
    "dbt": DbtCliResource(project_dir=business_card_project),
    "gemini": GeminiResource(
        api_key=os.getenv("GOOGLE_API_KEY"), model_name=os.getenv("MODEL_NAME")
    ),
    "duckdb_resource": DuckDBResource(
        database_path=os.getenv("DUCKDB_DATABASE_PATH", "database/business_cards.duckdb")
    ),
    "google_sheets": GoogleSheetsResource(
        credentials_path=os.getenv("GOOGLE_SHEETS_CREDENTIALS_PATH")
    ),
    "email_client": EmailClientResource(email_client=PostmarkEmailClient(
        api_token=os.getenv("POSTMARK_API_TOKEN"),
        sender_email=os.getenv("POSTMARK_SENDER_EMAIL")
    )),
}

all_sensors = [pdf_files_sensor, validated_records_sensor]
all_jobs = [process_all_assets_job, finalize_record_job]

defs = Definitions(
    assets=all_assets,
    resources=all_resources,
    sensors=all_sensors,
    jobs=all_jobs,
)
