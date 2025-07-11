import json
import os
from dagster import AssetExecutionContext, asset
from dagster_dbt import DbtCliResource, dbt_assets
import duckdb
from .config import FileConfig
from .card_processing_assets import processed_card_json
from .project import business_card_project

duckdb_database_path = business_card_project.project_dir.joinpath(
    "business_cards.duckdb"
)


@asset(compute_kind="python", deps=[processed_card_json])
def aggregated_results_json_to_db(
    context: AssetExecutionContext, config: FileConfig
) -> None:
    """
    Aggregates all individual processed card JSON files into a single results.json file.
    Returns the path to the aggregated file.
    """
    output_dir = config.output_dir
    all_results = []

    processed_files = [
        f
        for f in os.listdir(output_dir)
        if f.startswith("processed_") and f.endswith(".json")
    ]
    context.log.info(f"Found {len(processed_files)} processed files to aggregate.")
    for filename in processed_files:
        with open(os.path.join(output_dir, filename), "r") as f:
            # Each processed_*.json file contains a single JSON object
            card_data = json.load(f)
            all_results.append(card_data)
    final_output_path = os.path.join(output_dir, "results.json")
    with open(final_output_path, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
    context.log.info(f"Aggregated results saved to {final_output_path}")
    context.add_output_metadata(
        {
            "total_records": len(all_results),
            "total_files_aggregated": len(processed_files),
            "output_path": final_output_path,
        }
    )

    with duckdb.connect(os.fspath(duckdb_database_path)) as con:
        con.execute("create schema if not exists stg_cards_data")
        # Use an f-string to correctly insert the path variable
        load_query = (
            "create or replace table stg_cards_data as select * from read_json_auto(?)"
        )
        con.execute(load_query, [final_output_path])
        context.log.info(f"Loaded data from {final_output_path} into stg_cards_data")

        # Count the records and add as metadata
        record_count_result = con.execute(
            "SELECT COUNT(*) FROM stg_cards_data"
        ).fetchone()
        record_count = record_count_result[0] if record_count_result else 0
        context.add_output_metadata({"num_records_loaded": record_count})
        context.log.info(f"Loaded {record_count} records into the table.")
        # final_csv_output_path = os.path.join(output_dir, "results.csv")
        export_csv_query = """COPY (
                SELECT
                    company,
                    website,
                    prefix,
                    full_name,
                    first_name,
                    last_name,
                    title,
                    address_1,
                    address_2,
                    address_3,
                    city,
                    state_or_state_code,
                    country_or_country_code,
                    '''' || zip_code_or_post_code AS zip_code_or_post_code,
                    '''' || phone AS phone,
                    '''' || extension AS extension,
                    '''' || cell AS cell,
                    email,
                    retailer_type,
                    source,
                    date_imported,
                    contact_type,
                    notes,
                    time_imported,
                    products
                FROM stg_cards_data
                ) TO 'output/results.csv' (HEADER, DELIMITER ',')"""
        con.execute(export_csv_query)
        # context.add_output_metadata({"final_csv_output_path": final_csv_output_path})


@dbt_assets(manifest=business_card_project.manifest_path)
def dbt_card_processor_assets(
    context: AssetExecutionContext,
    dbt: DbtCliResource,
):
    yield from dbt.cli(["build"], context=context).stream()
