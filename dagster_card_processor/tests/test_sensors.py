import json
import pytest
from dagster import build_sensor_context, SensorResult

from dagster_card_processor.sensors import pdf_files_sensor, validated_records_sensor
from dagster_card_processor.resources import DuckDBResource


def test_pdf_files_sensor_no_new_files(mocker):
    """
    Tests the sensor when no new files are present.
    """
    mocker.patch("os.path.isdir", return_value=True)
    mocker.patch("os.listdir", return_value=["file1.pdf"])

    context = build_sensor_context(cursor=json.dumps(["file1.pdf"]))
    result = pdf_files_sensor(context)

    assert result is None


def test_pdf_files_sensor_initial_run(mocker):
    """
    Tests the sensor on its first run with new files.
    """
    new_files = ["card1.pdf", "card2.pdf"]
    mocker.patch("os.path.isdir", return_value=True)
    mocker.patch("os.listdir", return_value=new_files)

    context = build_sensor_context(cursor=None)

    # Spy on the context's update_cursor method before running the sensor
    spy_update_cursor = mocker.spy(context, "update_cursor")

    result = pdf_files_sensor(context)

    assert isinstance(result, SensorResult)
    assert len(result.run_requests) == 2
    assert sorted([rr.run_key for rr in result.run_requests]) == sorted(new_files)
    assert result.run_requests[0].tags == {"concurrency_key": "gemini_api"}
    assert sorted(result.dynamic_partitions_requests[0].partition_keys) == sorted(
        new_files
    )

    # Fix: Assert that the cursor was updated correctly (order-independent)
    spy_update_cursor.assert_called_once()
    # Get the actual call argument, parse it, and compare contents
    actual_cursor_str = spy_update_cursor.call_args[0][0]
    assert sorted(json.loads(actual_cursor_str)) == sorted(new_files)


def test_pdf_files_sensor_incremental_run(mocker):
    """
    Tests the sensor when one new file is added after a previous run.
    """
    initial_files = ["card1.pdf"]
    updated_files = ["card1.pdf", "card2.pdf"]
    newly_added_file = "card2.pdf"

    mocker.patch("os.path.isdir", return_value=True)
    mocker.patch("os.listdir", return_value=updated_files)

    context = build_sensor_context(cursor=json.dumps(initial_files))
    spy_update_cursor = mocker.spy(context, "update_cursor")

    result = pdf_files_sensor(context)

    assert isinstance(result, SensorResult)
    assert len(result.run_requests) == 1
    assert result.run_requests[0].run_key == newly_added_file
    assert result.run_requests[0].partition_key == newly_added_file
    assert result.dynamic_partitions_requests[0].partition_keys == [newly_added_file]

    # Fix: Assert that the cursor was updated with the full new list of files (order-independent)
    spy_update_cursor.assert_called_once()
    actual_cursor_str = spy_update_cursor.call_args[0][0]
    assert sorted(json.loads(actual_cursor_str)) == sorted(updated_files)


def test_pdf_files_sensor_directory_not_exist(mocker):
    """
    Tests that the sensor does nothing if the input directory doesn't exist.
    """
    mocker.patch("os.path.isdir", return_value=False)
    mock_listdir = mocker.patch("os.listdir")

    context = build_sensor_context()
    result = pdf_files_sensor(context)

    assert result is None
    mock_listdir.assert_not_called()


@pytest.fixture
def sensor_test_db(tmp_path):
    """
    Provides a DuckDBResource fixture pointing to a temporary, populated database
    for sensor testing. This simplifies test setup and improves readability.
    """
    db_path = tmp_path / "sensor_test.duckdb"
    resource = DuckDBResource(database_path=str(db_path))
    with resource.get_connection() as con:
        con.execute(
            """
            CREATE TABLE records (
                id INTEGER PRIMARY KEY, filename TEXT, status TEXT, data TEXT, source_data TEXT
            );
        """
        )
        # Base data for all test cases
        con.execute(
            "INSERT INTO records VALUES (1, 'file1.json', 'validated', '{}', '{}')"
        )
        con.execute(
            "INSERT INTO records VALUES (2, 'file2.json', 'validated', '{}', '{}')"
        )
        con.execute(
            "INSERT INTO records VALUES (3, 'file3.json', 'in_progress', '{}', '{}')"
        )
    return resource


@pytest.mark.parametrize(
    "cursor, setup_sql, expected_requests, expected_cursor, description",
    [
        (
            None,
            None,  # No additional setup needed for this case
            2,
            "2",
            "Initial run should find two validated records and set cursor to last ID.",
        ),
        (
            "2",
            None,  # No new records added
            0,
            None,
            "Run with cursor up-to-date should find no new records.",
        ),
        (
            "2",
            "INSERT INTO records VALUES (4, 'file4.json', 'validated', '{}', '{}')",
            1,
            "4",
            "Run with outdated cursor should find one new record and update cursor.",
        ),
    ],
)
def test_validated_records_sensor(
    sensor_test_db, cursor, setup_sql, expected_requests, expected_cursor, description
):
    """
    Tests the validated_records_sensor's ability to detect new records
    and update its cursor correctly across various scenarios.
    """
    # Arrange: Perform any additional, case-specific DB setup
    if setup_sql:
        with sensor_test_db.get_connection() as con:
            con.execute(setup_sql)

    context = build_sensor_context(
        resources={"duckdb_resource": sensor_test_db}, cursor=cursor
    )

    # Act
    result = validated_records_sensor(context)

    # Assert
    if expected_requests == 0:
        assert result is None, description
    else:
        assert result is not None, description
        assert len(result.run_requests) == expected_requests, description
        assert result.cursor == expected_cursor, description

        if cursor is None:  # For the initial run case
            assert (
                result.run_requests[0].run_config["ops"]["mark_as_processed"]["config"][
                    "record_id"
                ]
                == 1
            )
            assert (
                result.run_requests[1].run_config["ops"]["mark_as_processed"]["config"][
                    "record_id"
                ]
                == 2
            )
        elif cursor == "2" and setup_sql:  # For the new record case
            assert (
                result.run_requests[0].run_config["ops"]["mark_as_processed"]["config"][
                    "record_id"
                ]
                == 4
            )
