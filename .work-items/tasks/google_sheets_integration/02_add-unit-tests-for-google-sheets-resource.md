---
title: 'Add Unit Tests for Google Sheets Resource'
project_name: dagster_project
epic_name: google_sheets_integration
task_id: 2
story_id: 9
labels: 'backend, dagster, testing'
status: 'todo'
date_created: '2025-07-09T12:30:00-07:00'
date_verified_completed: ''
touched: '*'
---

**Description:**

Add comprehensive unit tests for the Google Sheets resource. These tests should cover both successful and failure scenarios.

**Acceptance Criteria:**

- A new test file is created (e.g., `dagster_project/tests/test_google_sheets_resource.py`).
- The tests use mocking to simulate the Google Sheets API, so no actual API calls are made during testing.
- The tests verify that the resource correctly parses the data from the sheet.
- The tests verify that the resource handles connection errors and invalid sheet/worksheet names gracefully.
