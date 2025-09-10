---
title: 'Configure Persistent Local Production Environment'
project_name: dagster-card-processor
epic_name: pipeline_robustness
task_id: 00_pipeline_robustness/02_configure_persistent_local_production_environment
labels: environment-management, deployment
status: todo
date_created: 2025-07-10T12:10:00-07:00
touched: *
---

## Task

Configure the Dagster environment for local production to be persistent, ensuring that run history and data are retained across restarts.

## Acceptance Criteria

- [ ] A dedicated `DAGSTER_HOME` directory is defined for the local production environment.
- [ ] Instructions are provided for starting the Dagster webserver and daemon in the persistent local production mode.
- [ ] The local production environment retains run history and asset materializations across restarts.

## Context/Links

- Related user story: ../../user_stories/pipeline_robustness/00_robust_file_processing_and_environment_management.md
