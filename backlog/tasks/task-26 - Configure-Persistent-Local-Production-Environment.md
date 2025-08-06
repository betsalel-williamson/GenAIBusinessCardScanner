---
id: task-26
title: Configure Persistent Local Production Environment
status: todo
assignee: []
created_date: '2025-08-06 21:34'
updated_date: '2025-08-06 21:35'
labels:
  - 'project:dagster-card-processor'
  - 'epic:pipeline_robustness'
  - 'type:task'
  - >-
    original_id:00_pipeline_robustness/02_configure_persistent_local_production_environment
  - environment-management
  - deployment
dependencies: []
---

## Description

Configure the Dagster environment for local production to be persistent, ensuring that run history and data are retained across restarts.

## Acceptance Criteria

- [ ] A dedicated DAGSTER_HOME directory is defined for the local production environment
- [ ] Instructions are provided for starting the Dagster webserver and daemon in the persistent local production mode
- [ ] The local production environment retains run history and asset materializations across restarts.
