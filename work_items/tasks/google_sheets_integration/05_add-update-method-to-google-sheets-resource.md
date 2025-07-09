---
title: 'Add Update Method to Google Sheets Resource'
project_name: dagster_card_processor
epic_name: google_sheets_integration
task_id: 5
story_id: 11
labels: 'backend, dagster, resource'
status: 'todo'
date_created: '2025-07-09T12:40:00-07:00'
date_verified_completed: ''
touched: '*'
---

**Description:**

Add a new method to the Google Sheets resource that allows updating a specific cell in the sheet.

**Acceptance Criteria:**

- The resource has a method `update_cell(sheet_id, worksheet_name, row_identifier, column_name, value)`.
- The method uses the Google Sheets API to find the correct row and update the specified cell.
- The method handles cases where the row or column is not found.
