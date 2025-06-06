from pathlib import Path
from dagster import AssetExecutionContext
from dagster_dbt import DbtCliResource, dbt_assets

# Use pathlib for robust path handling
DBT_PROJECT_PATH = Path(__file__).parent.parent.joinpath("dbt_project")

# Define the dbt resource as before
dbt_resource = DbtCliResource(
    project_dir=DBT_PROJECT_PATH.as_posix(),
    profiles_dir=DBT_PROJECT_PATH.as_posix()
)

dbt_manifest_path = DBT_PROJECT_PATH.joinpath("target", "manifest.json")

@dbt_assets(manifest=dbt_manifest_path)
def dbt_card_processor_assets(context: AssetExecutionContext, dbt: DbtCliResource):
    """
    This asset represents the execution of the dbt project.
    """
    yield from dbt.cli(["build"], context=context).stream()