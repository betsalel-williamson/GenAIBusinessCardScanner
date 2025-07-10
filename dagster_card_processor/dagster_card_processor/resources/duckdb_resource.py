import duckdb
from dagster import ConfigurableResource

class DuckDBResource(ConfigurableResource):
    """A resource for connecting to a DuckDB database."""

    database_path: str

    def get_connection(self) -> duckdb.DuckDBPyConnection:
        """Returns a connection to the DuckDB database."""
        return duckdb.connect(database=self.database_path, read_only=False)