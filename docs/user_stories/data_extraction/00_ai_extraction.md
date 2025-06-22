# Story 0: Core AI Data Extraction

- **Project**: `dagster_card_processor`
- **As a** System,
- **I want to** automatically process an uploaded business card PDF using a Generative AI,
- **so that** structured, machine-readable data is created for subsequent human validation.

## Acceptance Criteria

- A Dagster sensor detects any new PDF file added to the `cards_to_process` directory.
- For each new PDF, a unique Dagster run is triggered and tagged for rate-limiting.
- The pipeline generates a JSON schema for the AI based on the `stg_cards_data` dbt model's columns and descriptions.
- The pipeline uses the Google Gemini resource to process the PDF against the generated schema.
- The AI returns a single JSON object containing the extracted data.
- The system injects metadata fields (`source`, `date_imported`, `time_imported`) into the JSON object.
- The final, enriched JSON object is saved as a unique file in the `output/` directory.
- API calls to the Gemini service are rate-limited to avoid errors, with built-in retries on failure.
