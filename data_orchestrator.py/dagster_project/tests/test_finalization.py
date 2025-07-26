from unittest.mock import MagicMock
from dagster import materialize, ResourceDefinition

from dagster_project.finalization_assets import mark_as_processed
from dagster_project.defs import DuckDBResource


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
