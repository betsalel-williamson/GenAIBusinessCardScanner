---
title: 'Filter Contact List for Outreach'
project_name: dagster_project
epic_name: google_sheets_integration
story_id: 10
labels: 'backend, dagster, google-sheets'
status: 'todo'
date_created: '2025-07-09T12:35:00-07:00'
date_verified_completed: ''
touched: '*'
---

- **As a** Marketing Manager,
- **I want** to easily mark which contacts in our Google Sheet should receive an email,
- **so that** I have precise control over the outreach campaign.

## Acceptance Criteria

- The system can filter the full contact list based on the value in a specific column (e.g., `Send Email Status`).
- Only contacts with a designated value (e.g., `'Ready to Send'`) are included in the final outreach list.
- The filtering logic is implemented as a Dagster asset that takes the full contact list as input.

## Metrics for Success

- **Primary Metric**: The generated outreach list exactly matches the contacts I've marked as `'Ready to Send'` in the Google Sheet.
- **Secondary Metrics**: The filtering process is completed in under 5 seconds for a list of 1,000 contacts.
