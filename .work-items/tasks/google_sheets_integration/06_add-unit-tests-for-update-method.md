---
title: 'Add Unit Tests for Update Method'
project_name: dagster_project
epic_name: google_sheets_integration
task_id: 6
story_id: 11
labels: 'backend, dagster, testing'
status: 'todo'
date_created: '2025-07-09T12:40:00-07:00'
date_verified_completed: ''
touched: '*'
---

**Description:**

Add unit tests for the `update_cell` method in the Google Sheets resource.

**Acceptance Criteria:**

- The tests use mocking to simulate the Google Sheets API.
- The tests verify that the correct cell is updated with the correct value.
- The tests verify that the method handles errors gracefully, such as when the specified row or column cannot be found.
