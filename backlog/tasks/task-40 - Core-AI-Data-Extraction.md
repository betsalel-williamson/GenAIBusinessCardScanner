---
id: task-40
title: Core AI Data Extraction
status: done
assignee: []
created_date: '2025-08-06 21:39'
updated_date: '2025-08-06 21:39'
labels:
  - 'project:dagster_project'
  - 'epic:data_extraction'
  - 'type:user-story'
  - 'original_id:0'
  - backend
  - ai
  - dagster
dependencies: []
---

## Description

- **As a** System, - **I want to** automatically process an uploaded business card PDF using a Generative AI, - **so that** structured, machine-readable data is created for subsequent human validation. ## Metrics for Success - **Primary Metric**: 95% of business cards are processed successfully without manual intervention. - **Secondary Metrics**: Average processing time per card is under 1 minute.

## Acceptance Criteria

- [ ] A Dagster sensor detects any new PDF file added to the image_data_source directory
- [ ] For each new PDF
- [ ] a unique Dagster run is triggered and tagged for rate-limiting
- [ ] The pipeline generates a JSON schema for the AI based on the stg_cards_data dbt model's columns and descriptions
- [ ] The pipeline uses the Google Gemini resource to process the PDF against the generated schema
- [ ] The AI returns a single JSON object containing the extracted data
- [ ] The system injects metadata fields (source
- [ ] date_imported
- [ ] time_imported) into the JSON object
- [ ] The final
- [ ] enriched JSON object is saved as a unique file in the output/ directory
- [ ] API calls to the Gemini service are rate-limited to avoid errors
- [ ] with built-in retries on failure
- [ ] The aggregated_results_json_to_db asset is unit tested to verify correct aggregation of multiple JSON files and successful loading into the test database
- [ ] The GeminiResource is unit tested to ensure it correctly raises a dagster.RetryRequested exception when a google.api_core.exceptions.ResourceExhausted error occurs.
