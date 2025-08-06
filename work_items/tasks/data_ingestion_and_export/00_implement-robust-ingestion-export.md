---
title: 'Implement Robust JSON Ingestion and Secure CSV Export'
project_name: 'businessCardGenAI'
epic_name: 'data_ingestion_and_export'
task_id: '00_implement-robust-ingestion-export'
labels: 'backend, data-pipeline, duckdb'
status: 'verified completed'
date_created: '2025-08-05T00:00:00-07:00'
date_verified_completed: '2025-08-05T00:00:00-07:00'
touched: '*'
---

## Task

Modify the `aggregated_results_json_to_db` asset in `data_orchestrator.py/dagster_project/dagster_project/dbt_assets.py` to:

1. Ensure robust JSON data ingestion into the `stg_cards_data` DuckDB table, handling schema variations (e.g., null fields, missing columns) gracefully.
2. Parameterize the CSV export path in the `COPY` command to allow dynamic configuration and prevent SQL injection.

## Acceptance Criteria

- [x] The `stg_cards_data` table is created using `read_json_auto` with appropriate options to handle schema evolution (e.g., `union_by_name` if available, or explicit schema).
- [x] A new configuration field `csv_output_path` is added to `DbtConfig`.
- [x] The `export_csv_query` uses the `csv_output_path` from `DbtConfig` securely, passing it as a parameter to the `COPY` command.
- [x] The existing tests (if any) pass, and new tests are added to cover the robust ingestion and secure export functionality.

## Context/Links

- Related design spec: `../../data_ingestion_and_export/00_robust-data-ingestion-and-export/01_design-spec.md`
- File to modify: `data_orchestrator.py/dagster_project/dagster_project/dbt_assets.py`
