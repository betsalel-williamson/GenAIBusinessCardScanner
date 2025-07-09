---
title: 'Create Filter Contacts Asset'
project_name: dagster_card_processor
epic_name: google_sheets_integration
task_id: 3
story_id: 10
labels: 'backend, dagster, asset'
status: 'todo'
date_created: '2025-07-09T12:35:00-07:00'
date_verified_completed: ''
touched: '*'
---

**Description:**

Create a new Dagster asset that takes the raw contact list from the Google Sheet and filters it to produce a list of contacts ready for outreach.

**Acceptance Criteria:**

- The asset is defined in a new file (e.g., `dagster_card_processor/assets/email_outreach_assets.py`).
- The asset depends on the asset that reads the Google Sheet.
- The asset filters the list based on a configurable column name and value.
- The asset outputs a list of dictionaries, where each dictionary represents a contact to be emailed.
