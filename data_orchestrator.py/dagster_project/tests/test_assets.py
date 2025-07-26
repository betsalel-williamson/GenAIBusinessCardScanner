import json
from unittest.mock import patch
from dagster import build_asset_context

from dagster_project.schema_assets import response_schema_json, AssetConfig
from dagster_project.card_processing_assets import processed_card_json
from dagster_project.config import FileConfig


def test_response_schema_json(tmp_path, mock_dbt_manifest: dict):
    """
    Tests that the response_schema_json asset correctly parses the dbt manifest
    and filters out system-injected fields, using a shared fixture.
    """
    output_dir = tmp_path / "output"
    output_dir.mkdir()

    config = AssetConfig(
        output_dir=str(output_dir), system_injected_prefix="[SYSTEM-INJECTED]"
    )
    context = build_asset_context()

    with patch("dagster_project.schema_assets.json.load") as mock_json_load:
        mock_json_load.return_value = mock_dbt_manifest
        result_schema = response_schema_json(context, config)

    # Get the expected description dynamically from the mock manifest fixture.
    expected_description = mock_dbt_manifest["nodes"][
        "model.dbt_business_automations.stg_cards_data"
    ]["columns"]["company"]["description"]

    # Assertions
    assert "company" in result_schema["properties"]
    assert (
        "source" not in result_schema["properties"]
    )  # System field is correctly excluded
    assert result_schema["properties"]["company"]["description"] == expected_description

    # Validate the file written to disk
    output_file = output_dir / "response_schema.json"
    assert output_file.exists()
    with open(output_file, "r") as f:
        on_disk_schema = json.load(f)
    assert on_disk_schema == result_schema


def test_processed_card_json(mocker, tmp_path, mock_gemini_resource, sample_schema):
    """
    Tests the processed_card_json asset using shared fixtures for the Gemini
    resource and a consistent sample schema.
    """
    # mock_gemini_resource is now provided by the fixture

    # Mock datetime to control timestamps
    mock_datetime = mocker.patch("dagster_project.card_processing_assets.datetime")
    mock_now = mocker.MagicMock()
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

    pdf_filename = "test_card.pdf"
    (input_dir / pdf_filename).touch()

    # Create a dummy schema file using the consistent sample_schema fixture
    with open(output_dir / "response_schema.json", "w") as f:
        json.dump(sample_schema, f)

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

    # The default return from the fixture is used here
    assert result_data["company"] == "TestCorp"
    assert result_data["title"] == "Chief Tester"
    assert result_data["source"] == pdf_filename
    assert result_data["date_imported"] == "2024-01-01"
    assert result_data["time_imported"] == "12:00:00Z"
