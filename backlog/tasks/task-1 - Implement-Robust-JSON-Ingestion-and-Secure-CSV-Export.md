---
id: task-1
title: Implement Robust JSON Ingestion and Secure CSV Export
status: verified completed
assignee: []
created_date: '2025-08-06 21:28'
labels:
  - backend
  - data-pipeline
  - duckdb
  - 'project:businessCardGenAI'
  - 'epic:data_ingestion_and_export'
  - 'task_id:00_implement-robust-ingestion-export'
  - 'type:task'
dependencies: []
---

## Description

Modify the aggregated_results_json_to_db asset to ensure robust JSON ingestion into stg_cards_data DuckDB table and parameterize CSV export path.

## Acceptance Criteria

- [ ] The stg_cards_data table is created using read_json_auto with appropriate options
- [ ] A new configuration field csv_output_path is added to DbtConfig
- [ ] The export_csv_query uses the csv_output_path from DbtConfig securely
- [ ] Existing tests pass and new tests cover robust ingestion and secure export.
