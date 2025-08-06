import json
from unittest.mock import patch
from dagster import build_asset_context
import os
import duckdb

from dagster_project.schema_assets import response_schema_json, ResponseSchemaConfig
from dagster_project.card_processing_assets import processed_card_json
from dagster_project.config import DbtConfig, ProcessedCardConfig
from dagster_project.dbt_assets import aggregated_results_json_to_db


def test_response_schema_json(tmp_path, mock_dbt_manifest: dict):
    """
    Tests that the response_schema_json asset correctly parses the dbt manifest
    and filters out system-injected fields, using a shared fixture.
    """
    output_dir = tmp_path / "output"
    output_dir.mkdir()

    config = ResponseSchemaConfig(
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
        "source"
        not in result_schema["properties"]  # System field is correctly excluded
    )
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
    config = ProcessedCardConfig(input_dir=str(input_dir), output_dir=str(output_dir))

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


def test_aggregated_results_json_to_db_robust_ingestion_and_export(tmp_path):
    """
    Tests that aggregated_results_json_to_db robustly ingests JSON data with varying schemas
    and securely exports to a configurable CSV path.
    """
    # Setup directories
    output_dir = tmp_path / "output"
    output_dir.mkdir()

    # Create dummy processed JSON files with varying schemas
    json_data_1 = {
        "company": "Company A",
        "website": "www.companya.com",
        "full_name": "John Doe",
        "email": "john.doe@companya.com",
        "phone": "111-222-3333",
        "notes": "First contact",
    }
    json_data_2 = {
        "company": "Company B",
        "full_name": "Jane Smith",
        "title": "CEO",
        "email": "jane.smith@companyb.com",
        "address_1": "123 Main St",
        "notes": None,  # Explicit null
    }
    json_data_3 = {
        "company": "Company C",
        "full_name": "Peter Jones",
        "website": "www.companyc.org",
        "products": ["Product X", "Product Y"],
    }

    with open(output_dir / "processed_card_1.json", "w") as f:
        json.dump(json_data_1, f)
    with open(output_dir / "processed_card_2.json", "w") as f:
        json.dump(json_data_2, f)
    with open(output_dir / "processed_card_3.json", "w") as f:
        json.dump(json_data_3, f)

    # Configure DbtConfig with temporary paths
    duckdb_path = tmp_path / "test_db.duckdb"
    csv_output_path = tmp_path / "exported_results.csv"

    config = DbtConfig(
        output_dir=str(output_dir),
        duckdb_database_path=str(duckdb_path),
        csv_output_path=str(csv_output_path),
    )
    context = build_asset_context()

    # Run the asset
    aggregated_results_json_to_db(context=context, config=config)

    # Assertions for DuckDB ingestion
    with duckdb.connect(os.fspath(duckdb_path)) as con:
        # Verify all records are loaded
        record_count = con.execute("SELECT COUNT(*) FROM stg_cards_data").fetchone()[0]
        assert record_count == 3

        # Verify schema robustness and null handling
        df = con.execute("SELECT * FROM stg_cards_data ORDER BY company").fetchdf()

        # Company A: All fields present
        assert (
            df.loc[df["company"] == "Company A", "website"].iloc[0]
            == "www.companya.com"
        )
        # Assert phone number without leading single quote in DuckDB DataFrame
        assert df.loc[df["company"] == "Company A", "phone"].iloc[0] == "111-222-3333"
        assert (
            df.loc[df["company"] == "Company A", "title"].iloc[0] is None
        )  # Missing in JSON, should be null

        # Company B: Missing website, phone; explicit null for notes
        assert df.loc[df["company"] == "Company B", "website"].iloc[0] is None
        assert df.loc[df["company"] == "Company B", "phone"].iloc[0] is None
        assert df.loc[df["company"] == "Company B", "notes"].iloc[0] is None
        assert df.loc[df["company"] == "Company B", "title"].iloc[0] == "CEO"

        # Company C: Missing phone, email, notes, title, address_1; has products
        assert df.loc[df["company"] == "Company C", "phone"].iloc[0] is None
        assert df.loc[df["company"] == "Company C", "email"].iloc[0] is None
        assert df.loc[df["company"] == "Company C", "notes"].iloc[0] is None
        assert df.loc[df["company"] == "Company C", "title"].iloc[0] is None
        assert df.loc[df["company"] == "Company C", "address_1"].iloc[0] is None
        # Products column is a list in DuckDB, so convert tolist() for comparison
        assert df.loc[df["company"] == "Company C", "products"].iloc[0].tolist() == [
            "Product X",
            "Product Y",
        ]

    # Assertions for CSV export (string-based to preserve literal quotes)
    assert csv_output_path.exists()
    with open(csv_output_path, "r") as f:
        csv_content = f.read()

    # Check header row (order might vary due to dynamic select, but key columns should be there)
    header_line = csv_content.splitlines()[0]
    assert "company" in header_line
    assert "website" in header_line
    assert "full_name" in header_line
    assert "email" in header_line
    assert "phone" in header_line
    assert "notes" in header_line
    assert "title" in header_line
    assert "address_1" in header_line
    assert "products" in header_line

    # Check data rows for expected values and nulls (empty strings in CSV)
    # Company A: All fields present, phone with leading single quote
    assert (
        r"Company A,www.companya.com,John Doe,john.doe@companya.com,'111-222-3333,First contact"
        in csv_content.splitlines()[1]
    )

    # Company B: Missing website, phone; explicit null for notes
    # Check for key values and empty strings for missing/null fields
    assert "Company B" in csv_content
    assert "Jane Smith" in csv_content
    assert "jane.smith@companyb.com" in csv_content
    # Check for empty strings where website and phone are missing
    assert ",,Jane Smith" in csv_content  # Assuming website is before full_name
    assert ",CEO," in csv_content  # Assuming title is after full_name

    # Company C: Missing phone, email, notes, title, address_1; has products
    assert "Company C" in csv_content
    assert "www.companyc.org" in csv_content
    assert "Peter Jones" in csv_content
    # Products as a string in CSV, with inner quotes escaped
    assert '"[Product X, Product Y]"' in csv_content

    # Ensure correct number of lines (header + 3 data rows)
    assert len(csv_content.splitlines()) == 4
