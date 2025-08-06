---
id: task-9
title: Add Integration Tests for Email Campaign Pipeline
status: todo
assignee: []
created_date: '2025-08-06 21:31'
updated_date: '2025-08-06 21:31'
labels:
  - 'project:dagster_project'
  - 'epic:email_orchestration_pipeline'
  - 'type:task'
  - 'original_id:10'
  - 'story_id:14'
  - backend
  - dagster
  - testing
dependencies: []
---

## Description

Add integration tests for the email campaign pipeline. These tests will run the pipeline with mock resources to ensure the entire workflow is correct.

## Acceptance Criteria

- [ ] A new test file is created (e.g.
- [ ] dagster_project/tests/test_email_campaign_pipeline.py)
- [ ] The tests use mock versions of the Google Sheets and Postmark resources
- [ ] The tests verify that the pipeline correctly executes in both "dry-run" and "live" modes
- [ ] The tests verify that the Google Sheet is updated correctly after the emails are sent.
