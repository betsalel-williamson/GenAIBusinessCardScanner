---
id: task-27
title: Update Development Environment Setup
status: verified completed
assignee: []
created_date: '2025-08-06 21:35'
updated_date: '2025-08-06 21:35'
labels:
  - 'project:dagster-card-processor'
  - 'epic:pipeline_robustness'
  - 'type:task'
  - 'original_id:00_pipeline_robustness/03_update_development_environment_setup'
  - environment-management
  - development
dependencies: []
---

## Description

Ensure the development Dagster environment remains ephemeral and clean for testing purposes, explicitly using temporary directories for DAGSTER_HOME.

## Acceptance Criteria

- [ ] The development environment setup (e.g.
- [ ] test.sh or pytest configuration) explicitly uses a temporary DAGSTER_HOME
- [ ] Running tests or development commands starts Dagster in a clean state each time.
