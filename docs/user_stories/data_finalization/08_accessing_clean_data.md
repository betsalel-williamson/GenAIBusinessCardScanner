# Story 8: Accessing Clean, Structured Data

- **Project**: `dagster_card_processor`
- **As a** Data Analyst,
- **I want** a final, clean, and structured table in the database (e.g., `dim_business_cards`) that contains all the human-validated business card data,
- **so that** I can confidently use this data for CRM imports, reporting, and business intelligence without needing to perform any further cleaning or parsing.

## Acceptance Criteria

- A dbt model exists that transforms the validated JSON data into a structured, wide table.
- The final table has correctly-typed columns (e.g., `company` as TEXT, `date_imported` as DATE).
- This table is the single source of truth for all processed business card information.
