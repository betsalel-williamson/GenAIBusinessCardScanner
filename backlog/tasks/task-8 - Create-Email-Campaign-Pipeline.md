---
id: task-8
title: Create Email Campaign Pipeline
status: todo
assignee: []
created_date: '2025-08-06 21:31'
updated_date: '2025-08-06 21:31'
labels:
  - 'project:dagster_project'
  - 'epic:email_orchestration_pipeline'
  - 'type:task'
  - 'original_id:9'
  - 'story_id:13'
  - backend
  - dagster
  - pipeline
dependencies: []
---

## Description

Create a new Dagster pipeline that orchestrates the email campaign. This pipeline will fetch the contact list, filter it, and send the emails.

## Acceptance Criteria

- [ ] The pipeline is defined in a new file (e.g.
- [ ] dagster_project/pipelines/email_campaign_pipeline.py)
- [ ] The pipeline includes the assets for reading the Google Sheet
- [ ] filtering the contacts
- [ ] and sending the emails
- [ ] The pipeline has a configuration option to enable/disable "dry-run" mode.
