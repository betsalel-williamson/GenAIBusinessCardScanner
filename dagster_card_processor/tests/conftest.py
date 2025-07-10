import pytest
import yaml
from dotenv import dotenv_values
from unittest.mock import MagicMock
import os
import duckdb

PROJECT_ROOT = os.path.dirname(__file__)


@pytest.fixture(scope="session")
def dbt_schema_data() -> dict:
    """Loads and parses the dbt schema.yml file once per test session."""
    schema_path = os.path.join(
        PROJECT_ROOT, "..", "dbt_project", "models", "staging", "schema.yml"
    )
    with open(schema_path, "r") as f:
        return yaml.safe_load(f)


@pytest.fixture(scope="session")
def sample_env_data() -> dict:
    """Loads and parses the sample.env file once per test session."""
    env_path = os.path.join(PROJECT_ROOT, "..", "sample.env")
    return dotenv_values(env_path)


@pytest.fixture
def mock_dbt_manifest(dbt_schema_data: dict) -> dict:
    """
    Dynamically builds a mock dbt manifest structure from the actual schema.yml.
    This ensures our test data is always in sync with the data contract.
    """
    model_definition = next(
        (
            m
            for m in dbt_schema_data.get("models", [])
            if m.get("name") == "stg_cards_data"
        ),
        None,
    )
    if not model_definition:
        pytest.fail("Could not find 'stg_cards_data' model definition in schema.yml")

    columns = {
        col["name"]: {"description": col.get("description", "")}
        for col in model_definition.get("columns", [])
    }

    return {"nodes": {"model.dbt_card_processor.stg_cards_data": {"columns": columns}}}


@pytest.fixture
def mock_gemini_resource() -> MagicMock:
    """Provides a MagicMock of the GeminiResource."""
    mock_resource = MagicMock()
    mock_resource.process_single_pdf.return_value = {
        "company": "TestCorp",
        "title": "Chief Tester",
    }
    return mock_resource


@pytest.fixture
def sample_schema(mock_dbt_manifest: dict, sample_env_data: dict) -> dict:
    """
    Generates a sample JSON schema based on the mock dbt manifest,
    replicating the logic of the response_schema_json asset.
    The data is sourced dynamically from schema.yml and sample.env.
    """
    model_node = mock_dbt_manifest["nodes"]["model.dbt_card_processor.stg_cards_data"]
    system_injected_prefix = sample_env_data.get(
        "SYSTEM_INJECTED_PREFIX", "[SYSTEM-INJECTED]"
    )
    properties = {
        col_name: {"type": "string", "description": col_def.get("description", "")}
        for col_name, col_def in model_node["columns"].items()
        if not col_def.get("description", "").strip().startswith(system_injected_prefix)
    }
    return {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "Business Card",
        "description": "A single extracted business card object.",
        "type": "object",
        "properties": properties,
    }


@pytest.fixture
def test_db_conn() -> duckdb.DuckDBPyConnection:
    """Provides an in-memory DuckDB connection for test isolation."""
    conn = duckdb.connect(":memory:")
    conn.execute(
        """
        CREATE TABLE records (
            id INTEGER PRIMARY KEY,
            filename TEXT NOT NULL UNIQUE,
            status TEXT NOT NULL,
            data TEXT NOT NULL,
            source_data TEXT NOT NULL
        );
    """
    )
    yield conn
    conn.close()
