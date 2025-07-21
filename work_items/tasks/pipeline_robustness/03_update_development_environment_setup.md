---
title: 'Update Development Environment Setup'
project_name: dagster-card-processor
epic_name: pipeline_robustness
task_id: 00_pipeline_robustness/03_update_development_environment_setup
labels: environment-management, development
status: verified completed
date_created: 2025-07-10T12:15:00-07:00
date_verified_completed: '2025-07-21T00:00:00-07:00'
touched: '*'
---

## Task

Ensure the development Dagster environment remains ephemeral and clean for testing purposes, explicitly using temporary directories for `DAGSTER_HOME`.

## Acceptance Criteria

- [ ] The development environment setup (e.g., `test.sh` or `pytest` configuration) explicitly uses a temporary `DAGSTER_HOME`.
- [ ] Running tests or development commands starts Dagster in a clean state each time.

## Context/Links

- Related user story: ../../user_stories/pipeline_robustness/00_robust_file_processing_and_environment_management.md
