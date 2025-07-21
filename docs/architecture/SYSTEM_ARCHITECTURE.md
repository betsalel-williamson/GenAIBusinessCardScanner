# Project Architecture: Transcription Validation Tool

## Project Overview

This project provides a modern web application designed for efficiently validating and editing structured data extracted from documents, typically alongside their corresponding PDF sources. It offers a side-by-side interface for viewing a PDF and editing its associated data records, incorporating robust features like autosaving, undo/redo, and a clear data management workflow.

## High-Level Architecture

The application employs a **Client-Server-Side Rendered (SSR) architecture** built with Vite and Express, offering benefits like improved initial load performance and SEO.

### 1. Server-Side (Node.js/Express with Vite)

- **`server.ts`**: The core Express server. It integrates Vite in `middlewareMode` for SSR during development and serves pre-built client assets in production.
- **Database (`src/server/db.ts`)**: A **SQLite database** (`app_data.db`) serves as the central store for all individual validation records. It replaces the previous file-based system for `in_progress` and `validated` data.
- **API Endpoints (`src/server/api.ts` and sub-routes)**:
  - `/api/files`: Lists all available work, distinguishing between "batch" files (from `data_source/` that need ingestion) and "record" files (from the database that need validation).
  - `/api/files/:filename`: Serves the current data for a specific record from the database.
  - `/api/source-data/:filename`: Provides the original, untouched data for a specific record from the database's `source_data` column, used for the field-level revert feature.
  - `/api/autosave/:filename` (PATCH): Receives an updated record and updates its `data` and `status` in the database.
  - `/api/commit/:filename` (PATCH): Receives a finalized record, updates its status to 'validated' in the database, and identifies the next record for validation.
  - `/api/ingest/:filename` (POST): Reads a batch file from `data_source/`, splits it into individual records, and inserts each one into the database.
- **Static File Serving**: Serves static assets, including PDF images from `dagster_card_processor/cards_to_process/`.

### 2. Client-Side (React/TypeScript with Vite)

- **React App (`src/client/App.tsx`)**: The main React application defines the client-side routes using `react-router-dom`.
- **SSR Entry Points (`src/client/entry-client.tsx`, `src/client/entry-server.tsx`)**: Handle hydration on the client and server-side rendering respectively.
- **Pages**:
  - `HomePage.tsx`: Displays a list of batch files and individual records, providing actions to "Ingest" or "Validate".
  - `ValidatePage.tsx`: The primary validation interface, composing the `ImagePane` and `DataEntryPane`.
- **Components**:
  - `ImagePane.tsx`: Renders PDF documents using `pdfjs-dist`.
  - `DataEntryPane.tsx`: Displays editable fields for the current data record.
- **Custom Hooks (`src/client/hooks/`)**:
  - `useValidationData.ts`: The central state management and logic hub for `ValidatePage`, handling data fetching, autosaving, undo/redo, and keyboard shortcuts.

## Data Management and Workflow

The system uses a hybrid approach of a database and specific directories for a clear data lifecycle:

1. **`data_source/` (Directory)**: Contains original, multi-record JSON **batch files** that need to be processed. This is the starting point of the ingestion pipeline.
2. **SQLite Database (`app_data.db`)**: The core of the new architecture. It contains a `records` table where each row represents a single record to be validated. A record has a `status` of `'source'`, `'in_progress'`, or `'validated'`.
3. **`data_processed_batches/` (Directory)**: After a batch file from `data_source/` is successfully ingested into the database, it is moved here for archival purposes.

**Workflow:**

1. A user places a batch JSON file into `data_source/`.
2. On the `HomePage`, the file appears with an "Ingest" button.
3. The user clicks "Ingest". The server reads the batch file, creates a new entry in the SQLite `records` table for each item in the batch, and moves the original file to `data_processed_batches/`.
4. The individual records now appear on the `HomePage` with a "Validate" button.
5. A user clicks "Validate" to open `ValidatePage`. All changes are autosaved to the database, updating the record's `data` and setting its `status` to `'in_progress'`.
6. When the user clicks "Commit & Next File", the record's status is updated to `'validated'` in the database.

This workflow ensures data integrity, transactional ingestion, and a clear separation between raw data batches and active validation work.
