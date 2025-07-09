---
title: 'Use Google Sheet as the Contact Source'
project_name: dagster_card_processor
epic_name: google_sheets_integration
story_id: 9
labels: 'backend, dagster, google-sheets'
status: 'todo'
date_created: '2025-07-09T12:30:00-07:00'
date_verified_completed: ''
touched: '*'
---

- **As a** Marketing Manager,
- **I want** the system to use our Google Sheet as the single source of truth for contacts,
- **so that** I can easily manage the outreach list in a familiar tool.

## Acceptance Criteria

- The system can securely connect to a specified Google Sheet and read its contents.
- The contact list, including names, emails, and outreach status, is successfully parsed from the sheet.
- The connection details (e.g., sheet ID, credentials path) are configurable and not hard-coded.

## Metrics for Success

- **Primary Metric**: 100% of contacts marked for outreach in the Google Sheet are successfully retrieved by the system.
- **Secondary Metrics**: Any changes made to the contact list in the Google Sheet are reflected in the system on the next run.
