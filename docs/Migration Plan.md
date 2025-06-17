# Migration Plan: Unified Card Processing & Validation System

## 1. Objective

Integrate the Dagster AI pipeline with the web-based Validation Tool to create a seamless, end-to-end workflow for processing business cards. This plan consolidates the two separate databases (SQLite and DuckDB) into a single DuckDB instance that serves as the central state manager for the entire process.

The final workflow will be:

1. **Ingestion**: A PDF is added to a directory.
2. **AI Extraction**: Dagster runs an AI pipeline, extracts data, and inserts a new record into a shared DuckDB table with a `needs_validation` status.
3. **Human Validation**: The new record appears in the Validation Tool UI. A user reviews, corrects, and "commits" the data. The record's status is updated to `validated`.
4. **Finalization**: A second Dagster pipeline detects `validated` records, processes them into a final clean table using dbt, and marks them as `processed`.

---

## 2. Migration Phases

### Phase 1: Consolidate on DuckDB & Refactor Validation Tool

**Goal**: Replace the Validation Tool's SQLite backend with DuckDB. The application's external behavior will not change in this phase.

1. **Establish Shared Database Location**:
    * Create a new top-level directory, `database/`.
    * The single DuckDB file, `business_cards.duckdb`, will reside here. This location is accessible by both the Dagster and Validation Tool processes.

2. **Update Validation Tool Backend**:
    * Add the `duckdb-async` dependency to the `validation_tool.ts` `package.json`.
    * Modify `src/server/db.ts` to initialize and connect to `database/business_cards.duckdb`.
    * Define the `records` table schema within the `initDb` function. It should be nearly identical to the old SQLite schema: `id`, `filename`, `status`, `data`, `source_data`.
    * Refactor all API route handlers (`autosave.ts`, `commit.ts`, `files.ts`, `sourceData.ts`) to use DuckDB queries. The SQL syntax is compatible.
    * Remove the `sqlite3` and `sqlite` dependencies.

3. **Update dbt Configuration**:
    * Modify `dagster_card_processor/dbt_project/profiles.yml` to point to the new shared database path: `../../database/business_cards.duckdb`.

4. **Remove Obsolete Files**:
    * Delete `src/server/migrate.ts`. Its function is no longer needed.
    * Delete any lingering `app_data.db` files.

### Phase 2: Integrate AI Pipeline Output

**Goal**: Modify the Dagster pipeline to write AI-extracted data directly into the shared DuckDB, creating work for the Validation Tool.

1. **Refactor Dagster's `card_processing_assets`**:
    * The `processed_card_json` asset will no longer write a JSON file to the `output/` directory.
    * Instead, after receiving data from the Gemini resource, it will connect to the shared DuckDB.
    * It will execute an `INSERT` statement into the `records` table.
    * Each new record will contain:
        * `filename`: A new, unique identifier (e.g., `card_xyz_uuid.json`).
        * `status`: `'needs_validation'`.
        * `data`: The JSON string from the AI.
        * `source_data`: The same JSON string (this is the "original" data for the validation step).

2. **Remove Redundant Dagster Assets & Logic**:
    * The `aggregated_results_json_to_db` asset is now obsolete, as intermediate files are no longer created. Delete this asset.
    * The dependency on aggregating files is removed. The workflow simplifies to: `pdf_file -> processed_card_json (now writes to DB)`.

3. **Remove Validation Tool's Ingestion Logic**:
    * The concept of "ingesting" a batch file is now handled by Dagster's per-PDF processing.
    * Delete `src/server/routes/ingest.ts`.
    * Remove the `data_source/` and `data_processed_batches/` directories and all server logic that references them.
    * Update the `HomePage.tsx` component in the Validation Tool to remove the "Ingest" button and logic for "batch" file types. The homepage will now only display a list of individual records from the database.

### Phase 3: Create the Finalization Pipeline

**Goal**: Build a new Dagster pipeline that triggers on human-validated data, runs dbt transformations, and completes the workflow.

1. **Create a `validated_records_sensor` in Dagster**:
    * This new sensor will query the `records` table for `status = 'validated'`.
    * It will use a cursor (e.g., the max `id` processed) to only find newly validated records since its last run.
    * For each new validated record, it will trigger a new "finalize" job, passing the record's filename or ID.

2. **Create New `dbt` Models for Final Data**:
    * The old `stg_cards_data.sql` model, which read from a JSON file, is obsolete. Remove it.
    * Create a new dbt model, `models/staging/stg_validated_records.sql`. This model will read directly from the `records` table in DuckDB (`SELECT * FROM main.records WHERE status = 'validated'`).
    * Create a final dbt model, `models/marts/dim_business_cards.sql`. This model will select from `stg_validated_records`, use DuckDB's JSON functions to parse the `data` column, and structure it into a clean, typed, and wide table. This becomes the final, authoritative output.

3. **Create a `mark_as_processed` Asset in Dagster**:
    * After the dbt job successfully runs for a given record, a final Dagster asset in the chain must run.
    * This asset will execute an `UPDATE` statement on the `records` table, changing the status of the processed record from `validated` to `processed`. This prevents the sensor from picking it up again.

4. **Update Dagster Definitions**:
    * Wire the new sensor, job, and dbt assets together in `dagster_card_processor/__init__.py`.

### Phase 4: Cleanup and Documentation

**Goal**: Remove all remaining obsolete code and update documentation to reflect the new, unified architecture.

1. **Code Cleanup**:
    * Remove the `output/` directory from `dagster_card_processor` as it's no longer used.
    * Review `pyproject.toml` and `requirements.txt` for any unused dependencies.
    * Review the Validation Tool's `types.d.ts` and components for any types or props related to the old batch/index workflow.

2. **Documentation Update**:
    * Heavily revise `README.md` for both projects. The two READMEs should be merged or cross-referenced.
    * The new `README.md` must describe the full, end-to-end process: how to add a PDF, how the system automatically processes it, where to find it in the validation UI, and where the final data lands.
    * Update `docs/ARCHITECTURE.md` in the Validation Tool to describe the DuckDB-centric architecture and its role as a UI for the Dagster pipeline.