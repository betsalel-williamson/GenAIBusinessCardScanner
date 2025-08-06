import json
import os
from dagster import AssetExecutionContext, asset
from dagster_dbt import DbtCliResource, dbt_assets
import duckdb
from .config import DbtConfig
from .card_processing_assets import processed_card_json
from .project import business_card_project


@asset(compute_kind="python", deps=[processed_card_json])
def aggregated_results_json_to_db(
    context: AssetExecutionContext, config: DbtConfig
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

    with duckdb.connect(os.fspath(config.duckdb_database_path)) as con:
        con.execute("create schema if not exists stg_cards_data")
        # Use union_by_name to handle schema evolution gracefully
        load_query = "create or replace table stg_cards_data as select * from read_json_auto(?, union_by_name=true)"
        con.execute(load_query, [final_output_path])
        context.log.info(f"Loaded data from {final_output_path} into stg_cards_data")

        # Count the records
        record_count_result = con.execute(
            "SELECT COUNT(*) FROM stg_cards_data"
        ).fetchone()
        record_count = record_count_result[0] if record_count_result else 0
        context.log.info(f"Loaded {record_count} records into the table.")

        # Dynamically generate the SELECT clause for COPY to handle varying schemas
        columns_info = con.execute("PRAGMA table_info('stg_cards_data')").fetchall()
        column_names = [col[1] for col in columns_info]

        select_columns = []
        for col_name in column_names:
            if col_name in ["zip_code_or_post_code", "phone", "extension", "cell"]:
                # This is the correct logic to prepend a literal single quote for CSV export
                select_columns.append(f"'''' || {col_name} AS {col_name}")
            else:
                select_columns.append(col_name)

        select_clause = ", ".join(select_columns)

        # Securely embed the path by escaping single quotes
        escaped_csv_output_path = os.fspath(config.csv_output_path).replace("'", "''")
        export_csv_query = f"""COPY (
                SELECT
                    {select_clause}
                FROM stg_cards_data
                ) TO '{escaped_csv_output_path}' (HEADER, DELIMITER ',')"""
        con.execute(export_csv_query)

        # Combine all metadata into a single call
        context.add_output_metadata(
            {
                "total_records": len(all_results),
                "total_files_aggregated": len(processed_files),
                "output_path": final_output_path,
                "num_records_loaded": record_count,
                "final_csv_output_path": config.csv_output_path,
            }
        )


@dbt_assets(manifest=business_card_project.manifest_path)
def dbt_business_automations_assets(
    context: AssetExecutionContext,
    dbt: DbtCliResource,
):
    yield from dbt.cli(["build"], context=context).stream()
