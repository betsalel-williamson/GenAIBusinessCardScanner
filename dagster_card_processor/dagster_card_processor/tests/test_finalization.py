from unittest.mock import MagicMock
import pytest
from dagster import materialize, build_sensor_context, ResourceDefinition

from dagster_card_processor.finalization_assets import mark_as_processed
from dagster_card_processor.sensors import validated_records_sensor
from dagster_card_processor.resources import DuckDBResource


class NoOpConnectionManager:
    """
    A context manager that wraps a database connection but does nothing on __exit__.
    This prevents the `with` statement in the asset from closing the connection
    that the test fixture provides, so we can run assertions on it after the asset executes.
    """

    def __init__(self, conn):
        self._conn = conn

    def __enter__(self):
        return self._conn

    def __exit__(self, exc_type, exc_val, exc_tb):
        # Do not close the connection
        pass


def test_mark_as_processed_asset(test_db_conn):
    """
    Tests that the mark_as_processed asset correctly updates a record's status
    from 'validated' to 'processed' using the `materialize` test utility.
    """
    # Arrange: Insert a 'validated' record into the test DB
    test_db_conn.execute(
        "INSERT INTO records VALUES (1, 'test.json', 'validated', '{}', '{}')"
    )

    # Mock the DuckDB resource to return our NoOpConnectionManager.
    mock_duckdb_resource = MagicMock(spec=DuckDBResource)
    mock_duckdb_resource.get_connection.return_value = NoOpConnectionManager(
        test_db_conn
    )

    # Act: Use `materialize` to execute the asset.
    result = materialize(
        [mark_as_processed],
        resources={
            "duckdb_resource": ResourceDefinition.hardcoded_resource(
                mock_duckdb_resource
            )
        },
        run_config={"ops": {"mark_as_processed": {"config": {"record_id": 1}}}},
    )

    # Assert: The run was successful and the database was updated.
    assert result.success
    db_result = test_db_conn.execute(
        "SELECT status FROM records WHERE id = 1"
    ).fetchone()
    assert db_result is not None, "Record with ID 1 not found after asset execution."
    assert db_result[0] == "processed"


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
