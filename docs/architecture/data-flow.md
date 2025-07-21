# Data Flow

This document describes how data moves through the system, from ingestion to processing and storage within a local development environment.

## 1. Data Ingestion

Data primarily enters the system through:

- **User Uploads**: Business card images are uploaded via the `validation_tool.ts` web application (frontend) to its Express.js backend.

## 2. Data Processing Pipeline

Once ingested, data flows through a multi-stage processing pipeline:

1. **Initial Validation & Storage (`validation_tool.ts` backend)**: The Express.js backend receives the uploaded image, performs initial validation (format, size), and stores it on a shared Docker volume.
2. **Orchestration (Dagster)**: A trigger (manual or automated) initiates a Dagster job within the `dagster_business_automations` project.
3. **OCR (Dagster)**: The Dagster pipeline retrieves the image from the shared Docker volume and sends it to an OCR service (e.g., Tesseract) to extract text.
4. **Data Extraction & Normalization (Dagster)**: Extracted text is parsed to identify key fields (name, title, company, contact info) and normalized into a consistent format. This process may involve `google-generativeai` for advanced parsing.
5. **Data Transformation (dbt-duckdb)**: Normalized data is transformed and loaded into a DuckDB database using dbt models.
6. **Notifications (Dagster)**: The Dagster pipeline can trigger notifications (e.g., via Postmark for emails).

## 3. Data Storage

Processed data is stored in local, containerized services:

- **Shared Docker Volume**: Raw uploaded images are stored on a shared Docker volume, accessible by both `validation_tool.ts` and `dagster_business_automations`.
- **SQLite Database**: The `validation_tool.ts` backend uses a local SQLite database for its internal data (e.g., tracking uploaded files, basic metadata).
- **DuckDB Database**: The `dagster_business_automations` project uses a local DuckDB database (managed by dbt) for storing processed and transformed business card data.

## 4. Data Consumption

Processed and stored data can be consumed locally:

- **Web Application Display**: Users can view, search, and manage their business card contacts through the `validation_tool.ts` web interface, which retrieves data from its SQLite database and potentially from the Dagster-managed DuckDB.
- **API Access**: Local tools or scripts can retrieve processed data via the `validation_tool.ts` API endpoints.
- **Reporting/Analytics (Future)**: Local data analysis and reporting directly from the DuckDB database.

## 5. Current State

- User uploads are handled by `validation_tool.ts` and stored on the local filesystem.
- The Dagster pipeline (`dagster_business_automations`) is set up to process data, but its integration with the `validation_tool.ts` for triggering and data exchange needs to be formalized.
- Data is stored in SQLite and DuckDB.

## 6. Immediate Goals

- Establish clear data transfer mechanisms between `validation_tool.ts` and `dagster_business_automations`.
- Implement a shared Docker volume for robust local file storage.
- Ensure data consistency across SQLite and DuckDB.

## 7. Future Considerations

- **External Object Storage**: Migrate to cloud-based object storage (e.g., S3, GCS) for production, which would require updating application code to use S3 client libraries.
- **Centralized Database**: Consolidate data into a single, scalable relational database (e.g., PostgreSQL) for production.
- **Real-time Processing**: Explore streaming data processing for near real-time updates.

## Data Flow Diagram

```mermaid
graph TD
    A[User Uploads] --> B(Validation Tool Frontend)
    B --> C(Validation Tool Backend - Express.js)
    C --> D[Shared Docker Volume (Raw Images)]
    C --> E[SQLite DB (Metadata)]
    C -- Trigger --> F(Dagster - Data Processing & Automation)
    F --> D
    F --> G(OCR Service)
    F --> H(Google Generative AI)
    F --> I(dbt - Data Transformation)
    I --> J[DuckDB (Processed Data)]
    F --> K(Postmark - Notifications)
    J --> L(Validation Tool Frontend - Display)
    E --> L
    C --> L
```
