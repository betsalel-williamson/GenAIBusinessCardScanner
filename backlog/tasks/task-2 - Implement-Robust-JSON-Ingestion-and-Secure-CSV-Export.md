---
id: task-2
title: Implement Robust JSON Ingestion and Secure CSV Export
status: verified completed
assignee: []
created_date: '2025-08-06 21:29'
updated_date: '2025-08-06 21:29'
labels:
  - 'project:businessCardGenAI'
  - 'epic:data_ingestion_and_export'
  - 'type:task'
  - 'original_id:00_implement-robust-ingestion-export'
  - backend
  - data-pipeline
  - duckdb
dependencies: []
---

## Description

Modify the aggregated_results_json_to_db asset in data_orchestrator.py/dagster_project/dagster_project/dbt_assets.py to: 1. Ensure robust JSON data ingestion into the stg_cards_data DuckDB table, handling schema variations (e.g., null fields, missing columns) gracefully. 2. Parameterize the CSV export path in the COPY command to allow dynamic configuration and prevent SQL injection.

## Acceptance Criteria

- [ ] The stg_cards_data table is created using read_json_auto with appropriate options to handle schema evolution (e.g.
- [ ] union_by_name if available
- [ ] or explicit schema)
- [ ] A new configuration field csv_output_path is added to DbtConfig
- [ ] The export_csv_query uses the csv_output_path from DbtConfig securely
- [ ] passing it as a parameter to the COPY command
- [ ] The existing tests (if any) pass
- [ ] and new tests are added to cover the robust ingestion and secure export functionality.
