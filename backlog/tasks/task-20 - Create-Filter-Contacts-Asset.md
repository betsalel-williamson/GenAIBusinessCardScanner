---
id: task-20
title: Create Filter Contacts Asset
status: todo
assignee: []
created_date: '2025-08-06 21:33'
updated_date: '2025-08-06 21:33'
labels:
  - 'project:dagster_project'
  - 'epic:google_sheets_integration'
  - 'type:task'
  - 'original_id:3'
  - 'story_id:10'
  - backend
  - dagster
  - asset
dependencies: []
---

## Description

Create a new Dagster asset that takes the raw contact list from the Google Sheet and filters it to produce a list of contacts ready for outreach.

## Acceptance Criteria

- [ ] The asset is defined in a new file (e.g.
- [ ] dagster_project/assets/email_outreach_assets.py)
- [ ] The asset depends on the asset that reads the Google Sheet
- [ ] The asset filters the list based on a configurable column name and value
- [ ] The asset outputs a list of dictionaries
- [ ] where each dictionary represents a contact to be emailed.
