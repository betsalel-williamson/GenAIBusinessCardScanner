from unittest.mock import patch

from dagster_project.defs import DuckDBResource


def test_duckdb_resource_get_connection():
    """Test the DuckDB resource can get a connection."""
    with patch("duckdb.connect") as mock_connect:
        resource = DuckDBResource(database_path=":memory:")
        resource.get_connection()
        mock_connect.assert_called_once_with(database=":memory:", read_only=False)
