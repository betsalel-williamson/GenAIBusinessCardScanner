# Migration Plan: Unified Card Processing & Validation System

## 1. Objective

Integrate the Dagster AI pipeline with the web-based Validation Tool to create a seamless, end-to-end workflow for processing business cards. This plan consolidates the two separate databases (SQLite and DuckDB) into a single DuckDB instance and adds a file upload feature to the UI, making it the sole entry point for the entire system.

The final workflow will be:

1. **Upload (UI)**: A user uploads one or more PDF files via the Validation Tool's web interface.
2. **Storage (Backend)**: The web server saves the PDFs to a designated directory watched by Dagster.
3. **AI Extraction (Dagster)**: A Dagster sensor detects the new files, runs an AI pipeline to extract data, and inserts new records into a shared DuckDB table with a `needs_validation` status.
4. **Human Validation (UI)**: The new records appear in the Validation Tool UI. A user reviews, corrects, and "commits" the data, updating the record's status to `validated`.
5. **Finalization (Dagster)**: A second Dagster pipeline detects `validated` records, uses dbt to transform them into a final clean table, and marks them as `processed`.

---

## 2. Migration Phases

### Phase 1: Consolidate on DuckDB & Refactor Validation Tool

**Goal**: Replace the Validation Tool's SQLite backend with DuckDB. The application's external behavior will not change in this phase.

1. **Establish Shared Database Location**:
    * Create a new top-level directory, `database/`.
    * The single DuckDB file, `business_cards.duckdb`, will reside here. This location must be accessible by both the Dagster and Validation Tool processes.

2. **Update Validation Tool Backend**:
    * Add the `duckdb-async` dependency to the `validation_tool.ts` `package.json`.
    * Modify `src/server/db.ts` to initialize and connect to `database/business_cards.duckdb`.
    * Define the `records` table schema within the `initDb` function. The schema will be: `id`, `filename`, `status` (`needs_validation`, `validated`, `processed`), `data` (JSON), and `source_data` (JSON).
    * Refactor all API route handlers (`autosave.ts`, `commit.ts`, etc.) to use DuckDB queries. The SQL syntax is compatible.
    * Remove the `sqlite3` and `sqlite` dependencies.

3. **Update dbt Configuration**:
    * Modify `dagster_project/dbt_project/profiles.yml` to point to the new shared database path: `../../database/business_cards.duckdb`.

4. **Remove Obsolete Files**:
    * Delete `src/server/migrate.ts`. Its function is no longer needed.
    * Delete any lingering `app_data.db` files.

### Phase 2: Implement UI-Driven Ingestion & AI Pipeline Integration

**Goal**: Add PDF upload functionality to the UI and modify the Dagster pipeline to write AI-extracted data directly into the shared DuckDB.

1. **Create PDF Upload Endpoint (Validation Tool Backend)**:
    * Add a middleware like `multer` to handle `multipart/form-data`.
    * Create a new API route, `POST /api/upload`, in `validation_tool.ts`.
    * This endpoint will receive uploaded PDF files and save them to the `dagster_project/image_data_source/` directory. This directory already exists and is monitored by the Dagster sensor.

2. **Create PDF Upload Component (Validation Tool Frontend)**:
    * On `HomePage.tsx`, add a new UI component for file uploading.
    * This component will feature a file input and drag-and-drop area.
    * Upon upload, it will call the `POST /api/upload` endpoint and provide the user with feedback (e.g., success, error, progress).

3. **Refactor Dagster's `card_processing_assets`**:
    * Modify the `processed_card_json` asset. It will no longer write intermediate JSON files to the `output/` directory.
    * After receiving data from the Gemini resource, this asset will connect to the shared DuckDB instance.
    * It will execute an `INSERT` statement into the `records` table for each processed PDF.
    * The record will contain:
        * `filename`: A new, unique identifier (e.g., `{original_pdf_name}_{uuid}.json`).
        * `status`: `'needs_validation'`.
        * `data`: The JSON string from the AI.
        * `source_data`: The same JSON string (this is the "original" data for the revert-to-source feature).

4. **Remove Redundant Logic and Files**:
    * Delete the `aggregated_results_json_to_db` asset from `dbt_assets.py`.
    * Delete the `src/server/routes/ingest.ts` route from the Validation Tool, as Dagster now handles all ingestion.
    * Remove the `json_data_source/` and `data_processed_batches/` directories.
    * Update `HomePage.tsx` to remove any logic related to "batch" files or ingestion buttons.

### Phase 3: Create the Finalization Pipeline

**Goal**: Build a new Dagster pipeline that triggers on human-validated data, runs dbt transformations, and completes the workflow.

1. **Create a `validated_records_sensor` in Dagster**:
    * This new sensor will query the `records` table for records with `status = 'validated'`.
    * It will use a cursor (e.g., the maximum `id` processed) to only find newly validated records since its last run.
    * For each new validated record, it will trigger a "finalize" job, passing the record's filename or ID.

2. **Create New `dbt` Models for Final Data**:
    * Remove the old `stg_cards_data.sql` model, which read from a JSON file.
    * Create a new dbt model, `models/staging/stg_validated_records.sql`. This model will read directly from the `records` table in DuckDB (`SELECT * FROM main.records WHERE status = 'validated'`).
    * Create a final dbt model, `models/marts/dim_business_cards.sql`. This model will select from `stg_validated_records`, use DuckDB's JSON functions to parse the `data` column, and structure it into a clean, typed, and wide table. This becomes the final, authoritative output.

3. **Create a `mark_as_processed` Asset in Dagster**:
    * This asset will be the final step in the "finalize" job.
    * It will execute an `UPDATE` statement on the `records` table, changing the status of the processed record from `validated` to `processed`. This prevents the sensor from picking it up again.

4. **Update Dagster Definitions**:
    * Wire the new sensor, job, and dbt assets together in `dagster_project/__init__.py`.

### Phase 4: Cleanup and Documentation

**Goal**: Remove all remaining obsolete code and update documentation to reflect the new, unified architecture.

1. **Code Cleanup**:
    * Remove the `output/` directory from `dagster_project`.
    * Review `pyproject.toml`, `requirements.txt`, and `package.json` for unused dependencies.
    * Review the Validation Tool's types and components to remove anything related to the old batch workflow.
    * Review all unit tests and outline all features that should be unit tested.

2. **Documentation Update**:
    * Merge and rewrite the `README.md` files for both projects into a single, comprehensive guide for the unified application.
    * The new `README.md` must describe the full, end-to-end process: uploading a PDF via the UI, how the system automatically processes it, where to find it for validation, and where the final data lands.
    * Update `docs/ARCHITECTURE.md` to describe the new DuckDB-centric architecture and the UI-driven workflow.
