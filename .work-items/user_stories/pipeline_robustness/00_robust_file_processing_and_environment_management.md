---
title: 'Robust File Processing and Environment Management'
project_name: dagster-card-processor
epic_name: pipeline_robustness
story_id: 00_pipeline_robustness/00_robust_file_processing_and_environment_management
labels: data-pipeline, environment-management
status: todo
date_created: 2025-07-10T12:00:00-07:00
touched: *
---

- **As a** data pipeline operator,
- **I want to** ensure that processed business card files are not re-processed and that I can manage distinct development and local production Dagster environments,
- **so that** data integrity is maintained and deployment workflows are clear and reliable.

## Acceptance Criteria

- The system must prevent re-processing of already processed files.
- The local development Dagster environment must remain ephemeral and clean for testing.
- The local production Dagster environment must be persistent and allow for code updates without data loss.

## Metrics for Success

- **Primary Metric**: Zero instances of duplicate file processing in the local production environment.
- **Secondary Metrics**: Clear separation and easy switching between development and local production environments.
