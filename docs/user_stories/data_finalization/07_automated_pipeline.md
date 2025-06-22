# Story 7: Automated Finalization Pipeline

- **Project**: `dagster_card_processor`
- **As a** System,
- **I want to** automatically detect when a record has been marked as `validated` by a user in the web application,
- **so that** I can trigger the final data transformation pipeline without manual intervention.

## Acceptance Criteria

- A Dagster sensor (`validated_records_sensor`) runs on a schedule, querying the database for records with `status = 'validated'`.
- The sensor uses a cursor to ensure it only detects records that have not been previously processed by this pipeline.
- For each newly detected `validated` record, the sensor triggers a `finalize_record_job`.
- The `finalize_record_job` orchestrates the final processing steps.
- The final step in the job is an asset (`mark_as_processed`) that updates the record's status from `validated` to `processed` in the database, preventing it from being picked up by the sensor again.
