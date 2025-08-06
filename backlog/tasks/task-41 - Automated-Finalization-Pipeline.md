---
id: task-41
title: Automated Finalization Pipeline
status: done
assignee: []
created_date: '2025-08-06 21:39'
updated_date: '2025-08-06 21:39'
labels:
  - 'project:dagster_project'
  - 'epic:data_finalization'
  - 'type:user-story'
  - 'original_id:7'
  - backend
  - dagster
  - dbt
dependencies: []
---

## Description

- **As a** System, - **I want to** automatically detect when a record has been marked as validated by a user in the web application, - **so that** I can trigger the final data transformation pipeline without manual intervention. ## Metrics for Success - **Primary Metric**: 100% of validated records are processed by the finalization pipeline within 5 minutes of being marked as validated. - **Secondary Metrics**: Zero records are processed more than once.

## Acceptance Criteria

- [ ] A Dagster sensor (validated_records_sensor) runs on a schedule
- [ ] querying the database for records with status = 'validated'
- [ ] The sensor uses a cursor to ensure it only detects records that have not been previously processed by this pipeline
- [ ] For each newly detected validated record
- [ ] the sensor triggers a finalize_record_job
- [ ] The finalize_record_job orchestrates the final processing steps
- [ ] The final step in the job is an asset (mark_as_processed) that updates the record's status from validated to processed in the database
- [ ] preventing it from being picked up by the sensor again
- [ ] The mark_as_processed asset is unit tested against edge cases
- [ ] including attempts to process non-existent records or records with a status other than validated
- [ ] The validated_records_sensor is unit tested to verify it handles database connection errors (IOException
- [ ] CatalogException) gracefully without crashing.
