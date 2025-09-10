---
title: 'Add Integration Tests for Email Campaign Pipeline'
project_name: dagster_project
epic_name: email_orchestration_pipeline
task_id: 10
story_id: 14
labels: 'backend, dagster, testing'
status: 'todo'
date_created: '2025-07-09T12:50:00-07:00'
date_verified_completed: ''
touched: '*'
---

**Description:**

Add integration tests for the email campaign pipeline. These tests will run the pipeline with mock resources to ensure the entire workflow is correct.

**Acceptance Criteria:**

- A new test file is created (e.g., `dagster_project/tests/test_email_campaign_pipeline.py`).
- The tests use mock versions of the Google Sheets and Postmark resources.
- The tests verify that the pipeline correctly executes in both "dry-run" and "live" modes.
- The tests verify that the Google Sheet is updated correctly after the emails are sent.
