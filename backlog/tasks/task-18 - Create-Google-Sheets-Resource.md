---
id: task-18
title: Create Google Sheets Resource
status: todo
assignee: []
created_date: '2025-08-06 21:33'
updated_date: '2025-08-06 21:33'
labels:
  - 'project:dagster_project'
  - 'epic:google_sheets_integration'
  - 'type:task'
  - 'original_id:1'
  - 'story_id:9'
  - backend
  - dagster
  - resource
dependencies: []
---

## Description

Create a new Dagster resource that encapsulates the logic for connecting to the Google Sheets API. This resource will handle authentication and provide a method to read data from a specified sheet and worksheet.

## Acceptance Criteria

- [ ] The resource is defined in its own file (e.g.
- [ ] dagster_project/resources/google_sheets_resource.py)
- [ ] The resource uses the google-auth-oauthlib and google-api-python-client libraries
- [ ] The resource is configurable with the path to the service account credentials file
- [ ] The resource has a method read_sheet(sheet_id
- [ ] worksheet_name) that returns a list of dictionaries
- [ ] where each dictionary represents a row.
