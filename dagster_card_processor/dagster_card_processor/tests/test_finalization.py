from unittest.mock import MagicMock
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


def test_validated_records_sensor(tmp_path):
    """
    Tests the validated_records_sensor's ability to detect new records
    and update its cursor correctly, now using a real DuckDBResource.
    """
    # Arrange: Create a temporary database file and a DuckDBResource pointing to it
    db_path = tmp_path / "test.duckdb"
    test_resource = DuckDBResource(database_path=str(db_path))

    with test_resource.get_connection() as con:
        con.execute(
            """
            CREATE TABLE records (
                id INTEGER PRIMARY KEY, filename TEXT, status TEXT, data TEXT, source_data TEXT
            );
        """
        )
        # Insert test data
        con.execute(
            "INSERT INTO records VALUES (1, 'file1.json', 'validated', '{}', '{}')"
        )
        con.execute(
            "INSERT INTO records VALUES (2, 'file2.json', 'validated', '{}', '{}')"
        )
        con.execute(
            "INSERT INTO records VALUES (3, 'file3.json', 'in_progress', '{}', '{}')"
        )

    # --- Test Case 1: Initial run with no cursor ---
    context1 = build_sensor_context(resources={"duckdb_resource": test_resource})
    result1 = validated_records_sensor(context1)

    assert result1 is not None, "Sensor should yield a result"
    assert (
        len(result1.run_requests) == 2
    ), "Should find two validated records on initial run"
    assert (
        result1.run_requests[0].run_config["ops"]["mark_as_processed"]["config"][
            "record_id"
        ]
        == 1
    )
    assert (
        result1.run_requests[1].run_config["ops"]["mark_as_processed"]["config"][
            "record_id"
        ]
        == 2
    )
    assert result1.cursor == "2"

    # --- Test Case 2: Run with existing cursor, no new records ---
    context2 = build_sensor_context(
        resources={"duckdb_resource": test_resource}, cursor="2"
    )
    result2 = validated_records_sensor(context2)

    assert result2 is None, "Should not yield any results if no new records are found"

    # --- Test Case 3: Run with existing cursor, new records available ---
    with test_resource.get_connection() as con:
        con.execute(
            "INSERT INTO records VALUES (4, 'file4.json', 'validated', '{}', '{}')"
        )

    context3 = build_sensor_context(
        resources={"duckdb_resource": test_resource}, cursor="2"
    )
    result3 = validated_records_sensor(context3)

    assert result3 is not None, "Sensor should yield a result for new records"
    assert len(result3.run_requests) == 1, "Should find the one new validated record"
    assert (
        result3.run_requests[0].run_config["ops"]["mark_as_processed"]["config"][
            "record_id"
        ]
        == 4
    )
    assert result3.cursor == "4"
