from pathlib import Path

from dagster_dbt import DbtProject

DBT_PROJECT_PATH = Path(__file__).parent.parent.joinpath("../dbt_project")

business_card_project = DbtProject(
    project_dir=DBT_PROJECT_PATH.as_posix(),
    profiles_dir=DBT_PROJECT_PATH.as_posix(),
)
business_card_project.prepare_if_dev()
