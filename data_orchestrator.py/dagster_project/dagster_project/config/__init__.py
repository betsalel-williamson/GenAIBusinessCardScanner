import os
from dagster import Config


def _read_secret_file(
    docker_secret_name: str, local_env_var_name: str, default_value=""
) -> str:
    # Check if running inside a Docker container
    if os.path.exists("/.dockerenv"):
        try:
            with open(f"/run/secrets/{docker_secret_name}", "r") as f:
                return f.read().strip()
        except FileNotFoundError:
            return default_value
    else:
        # Not in Docker, prioritize local environment variable for local development
        local_path = os.getenv(local_env_var_name)
        if local_path and os.path.exists(local_path):
            with open(local_path, "r") as f:
                return f.read().strip()
        return default_value


class InputConfig(Config):
    input_dir: str = os.getenv("IMAGE_DATA_SOURCE", "/mnt/image_data_source")


class OutputConfig(Config):
    output_dir: str = os.getenv("JSON_DATA_SOURCE", "/mnt/json_data_source")


class DbtConfig(OutputConfig):
    dbt_executable: str = os.getenv("DBT_EXECUTABLE_PATH", "dbt")
    duckdb_database_path: str = os.getenv(
        "DUCKDB_DATABASE_PATH", "../dbt_project/target/dbt.duckdb"
    )
    csv_output_path: str = os.getenv(
        "CSV_OUTPUT_PATH", "/mnt/json_data_processed/results.csv"
    )


class GlobalAppConfig(DbtConfig):
    gemini_api_key: str = _read_secret_file(
        "google_api_key", "SECRET_GOOGLE_API_KEY_PATH"
    )
    gemini_model_name: str = os.getenv("MODEL_NAME", "gemini-2.5-flash")
    google_sheets_credentials_path: str = _read_secret_file(
        "google_sheets_credentials", "SECRET_GOOGLE_SHEETS_CREDENTIALS_PATH"
    )
    postmark_api_token: str = _read_secret_file(
        "postmark_api_token", "SECRET_POSTMARK_API_TOKEN_PATH"
    )
    postmark_sender_email: str = _read_secret_file(
        "postmark_sender_email", "SECRET_POSTMARK_SENDER_EMAIL_PATH"
    )


class ResponseSchemaConfig(OutputConfig):
    system_injected_prefix: str = os.getenv(
        "SYSTEM_INJECTED_PREFIX", "[SYSTEM-INJECTED]"
    )


class ProcessedCardConfig(InputConfig, OutputConfig):
    pdf_base_url: str = os.getenv("PDF_BASE_URL", "http://localhost:8000")
