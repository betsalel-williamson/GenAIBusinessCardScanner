import json
from unittest.mock import MagicMock, patch
import pytest
from dagster import build_asset_context

from dagster_card_processor.schema_assets import response_schema_json, AssetConfig
from dagster_card_processor.card_processing_assets import processed_card_json
from dagster_card_processor.config import FileConfig

# A simplified mock of the dbt manifest for testing
MOCK_MANIFEST = {
    "nodes": {
        "model.dbt_card_processor.stg_cards_data": {
            "columns": {
                "company": {"description": "The name of the company."},
                "email": {"description": "The contact's email address."},
                "source": {"description": "[SYSTEM-INJECTED] The source filename."},
            }
        }
    }
}


def test_response_schema_json(tmp_path):
    """
    Tests that the response_schema_json asset correctly parses the dbt manifest
    and filters out system-injected fields. We mock json.load to avoid
    the complexity of patching a read-only attribute on DbtProject.
    """
    output_dir = tmp_path / "output"
    output_dir.mkdir()

    config = AssetConfig(output_dir=str(output_dir), system_injected_prefix="[SYSTEM-INJECTED]")
    context = build_asset_context()

    # Use a with statement to scope the patch. This ensures the mock is only
    # active for the asset execution and not for the verification step.
    with patch("dagster_card_processor.schema_assets.json.load") as mock_json_load:
        mock_json_load.return_value = MOCK_MANIFEST
        # Run the asset inside the patch scope
        result_schema = response_schema_json(context, config)

    # Validate the returned schema object
    assert "company" in result_schema["properties"]
    assert "email" in result_schema["properties"]
    assert "source" not in result_schema["properties"]
    assert result_schema["properties"]["company"]["description"] == "The name of the company."

    # Validate the file written to disk (now outside the patch scope)
    output_file = output_dir / "response_schema.json"
    assert output_file.exists()
    with open(output_file, "r") as f:
        on_disk_schema = json.load(f)
    assert on_disk_schema == result_schema


def test_processed_card_json(mocker, tmp_path):
    """
    Tests the processed_card_json asset by mocking the Gemini API call.
    Ensures that system fields are injected and the output is saved correctly.
    """
    # Mock the GeminiResource
    mock_gemini_resource = MagicMock()
    mock_gemini_resource.process_single_pdf.return_value = {
        "company": "TestCorp",
        "title": "Chief Tester",
    }

    # Mock datetime to control timestamps
    mock_datetime = mocker.patch("dagster_card_processor.card_processing_assets.datetime")
    mock_now = MagicMock()
    mock_now.strftime.side_effect = lambda fmt: {
        "%Y-%m-%d": "2024-01-01",
        "%H:%M:%SZ": "12:00:00Z",
    }[fmt]
    mock_datetime.now.return_value = mock_now

    # Setup temporary directories and files
    input_dir = tmp_path / "input"
    output_dir = tmp_path / "output"
    input_dir.mkdir()
    output_dir.mkdir()

    # Create a dummy PDF partition file
    pdf_filename = "test_card.pdf"
    (input_dir / pdf_filename).touch()

    # Create a dummy schema file that the asset needs to read
    schema_content = {"type": "object", "properties": {}}
    with open(output_dir / "response_schema.json", "w") as f:
        json.dump(schema_content, f)

    # Build asset context and config
    context = build_asset_context(partition_key=pdf_filename)
    config = FileConfig(input_dir=str(input_dir), output_dir=str(output_dir))

    # Run the asset
    processed_card_json(context=context, config=config, gemini=mock_gemini_resource)

    # Assertions
    mock_gemini_resource.process_single_pdf.assert_called_once()

    output_path = output_dir / f"processed_{pdf_filename}.json"
    assert output_path.exists()

    with open(output_path, "r") as f:
        result_data = json.load(f)

    assert result_data["company"] == "TestCorp"
    assert result_data["title"] == "Chief Tester"
    assert result_data["source"] == pdf_filename
    assert result_data["date_imported"] == "2024-01-01"
    assert result_data["time_imported"] == "12:00:00Z"
