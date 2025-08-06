---
title: 'Design for Robust Business Card Data Ingestion and Secure Export'
project_name: 'businessCardGenAI'
epic_name: 'data_ingestion_and_export'
story_id: '00_robust-data-ingestion-and-export'
spec_id: '01_robust-data-ingestion-and-export'
status: 'draft'
date_created: '2025-08-05T00:00:00-07:00'
date_approved: ''
touched: '*'
---

## 1. Objective

To design a technical solution that ensures the business card data ingestion process is resilient to schema changes and that the data export to CSV is secure and configurable, directly supporting the user's need for reliable data processing.

## 2. Technical Design

The core of this design involves modifying the `aggregated_results_json_to_db` asset in `data_orchestrator.py/dagster_project/dagster_project/dbt_assets.py`. To handle schema evolution in JSON data, we will leverage DuckDB's `read_json_auto` function with an explicit schema definition or a more robust schema inference mechanism if `read_json_auto` proves insufficient for all edge cases. For the CSV export, we will parameterize the output path to prevent SQL injection and allow dynamic configuration.

### Ingestion Robustness

Instead of relying solely on `read_json_auto(?)` which might infer a schema that breaks on subsequent files with missing columns, we will explore two options:

1. **Explicit Schema Definition**: Define a comprehensive schema for the `stg_cards_data` table that includes all possible fields from the JSON, marking optional fields as nullable. This ensures consistency regardless of which fields are present in individual JSON files.
2. **Enhanced `read_json_auto` with `union_by_name`**: If DuckDB's `read_json_auto` supports a `union_by_name` or similar option, we will use it to combine schemas from multiple JSON files, ensuring all columns are present and nulls are handled for missing fields.

### Secure and Configurable Export

The CSV export path will be passed as a parameter to the DuckDB `COPY` command. This will involve:

1. Adding a new configuration parameter to `DbtConfig` for the CSV output directory/filename.
2. Modifying the `export_csv_query` to use this parameter securely, preventing direct string concatenation that could lead to SQL injection.

## 3. Key Changes

### 3.1. API Contracts

- **`DbtConfig`**: A new field, `csv_output_path` (or similar), will be added to `DbtConfig` to allow users to specify the desired CSV export location.

### 3.2. Data Models

- **`stg_cards_data` table**: The schema for this DuckDB table will be explicitly defined or inferred more robustly to accommodate all possible fields from the JSON input, ensuring nullability for optional fields.

### 3.3. Component Responsibilities

- **`aggregated_results_json_to_db` asset**: This asset will be updated to:
  - Load JSON data into `stg_cards_data` with improved schema handling.
  - Execute the `COPY` command with a parameterized output path for the CSV export.

## 4. Alternatives Considered

- **Pre-processing JSON for Schema Uniformity**: Considered transforming JSON files to a uniform schema before loading into DuckDB. This was rejected due to added complexity and the desire to leverage DuckDB's capabilities for schema inference and handling.
- **Using a separate Python CSV writer**: Considered writing the CSV directly from Python after loading data into a DuckDB DataFrame. Rejected to keep the data transformation and export logic within DuckDB's SQL capabilities for performance and simplicity.

## 5. Out of Scope

- Handling of malformed JSON files (assumes valid JSON input).
- Complex data type transformations beyond basic null handling and type inference.
- User interface for configuring the CSV export path (will be configured via `DbtConfig`).
