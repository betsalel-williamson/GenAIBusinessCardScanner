from pathlib import Path
import json
from dagster import AssetExecutionContext
from dagster_dbt import DbtCliResource, dbt_assets

DBT_PROJECT_PATH = Path(__file__).parent.parent.joinpath("dbt_project")

dbt_resource = DbtCliResource(
    project_dir=DBT_PROJECT_PATH.as_posix(),
    profiles_dir=DBT_PROJECT_PATH.as_posix()
)

dbt_manifest_path = DBT_PROJECT_PATH.joinpath("target", "manifest.json")

@dbt_assets(
    manifest=dbt_manifest_path
)
def dbt_card_processor_assets(
    context: AssetExecutionContext,
    dbt: DbtCliResource,
):
    """
    This asset executes the dbt project. It receives the path to the aggregated
    JSON file from the upstream `aggregated_results_json` asset.
    """
    # The file path is the value of our input.
    json_path = "/Users/saul/Repos/businessCardGenAI/dagster_card_processor/output/results.json"

    dbt_vars = {"validated_json_path": json_path}

    context.log.info(f"Running dbt build for stg_cards_data with vars: {dbt_vars}")

    # We only want to run the model that depends on this input.
    dbt_build_args = ["build", "--select", "stg_cards_data", "--vars", json.dumps(dbt_vars)]

    yield from dbt.cli(dbt_build_args, context=context).stream()
