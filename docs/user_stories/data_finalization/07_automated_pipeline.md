# Story 7: Automated Finalization Pipeline

- **Project**: `dagster_card_processor`
- **As a** System,
- **I want to** automatically detect when a record has been marked as `validated`,
- **so that** I can trigger the final dbt transformation pipeline without manual intervention.

## Acceptance Criteria

- A Dagster sensor runs on a schedule, querying the database for records with `status = 'validated'`.
- The sensor triggers a Dagster job for each newly validated record.
- After successful processing, the record's status is updated to `processed` to prevent it from being run again.
