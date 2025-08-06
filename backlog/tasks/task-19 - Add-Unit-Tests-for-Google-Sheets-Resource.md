---
id: task-19
title: Add Unit Tests for Google Sheets Resource
status: todo
assignee: []
created_date: '2025-08-06 21:33'
updated_date: '2025-08-06 21:33'
labels:
  - 'project:dagster_project'
  - 'epic:google_sheets_integration'
  - 'type:task'
  - 'original_id:2'
  - 'story_id:9'
  - backend
  - dagster
  - testing
dependencies: []
---

## Description

Add comprehensive unit tests for the Google Sheets resource. These tests should cover both successful and failure scenarios.

## Acceptance Criteria

- [ ] A new test file is created (e.g.
- [ ] dagster_project/tests/test_google_sheets_resource.py)
- [ ] The tests use mocking to simulate the Google Sheets API
- [ ] so no actual API calls are made during testing
- [ ] The tests verify that the resource correctly parses the data from the sheet
- [ ] The tests verify that the resource handles connection errors and invalid sheet/worksheet names gracefully.
