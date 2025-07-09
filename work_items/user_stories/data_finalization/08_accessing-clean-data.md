---
title: 'Accessing Clean, Structured Data'
project_name: dagster_card_processor
epic_name: data_finalization
story_id: 8
labels: 'backend, dbt, data-modeling'
status: 'done'
date_created: '2025-06-17T11:39:41-07:00'
date_verified_completed: '2025-06-22T10:10:33-07:00'
touched: '**'
---

- **As a** Data Analyst,
- **I want** a final, clean, and structured table in the database (e.g., `dim_business_cards`) that contains all the human-validated business card data,
- **so that** I can confidently use this data for CRM imports, reporting, and business intelligence without needing to perform any further cleaning or parsing.

## Acceptance Criteria

- A dbt model exists that transforms the validated JSON data into a structured, wide table.
- The final table has correctly-typed columns (e.g., `company` as TEXT, `date_imported` as DATE).
- This table is the single source of truth for all processed business card information.

## Metrics for Success

- **Primary Metric**: 100% of data in the final table conforms to the defined schema.
- **Secondary Metrics**: Data analysts can access and use the final table with zero data cleaning steps required.
