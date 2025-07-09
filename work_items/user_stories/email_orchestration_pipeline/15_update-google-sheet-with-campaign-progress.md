---
title: 'Update Google Sheet with Campaign Progress'
project_name: dagster_card_processor
epic_name: email_orchestration_pipeline
story_id: 15
labels: 'backend, dagster, workflow'
status: 'todo'
date_created: '2025-07-09T12:50:00-07:00'
date_verified_completed: ''
touched: '*'
---

- **As a** Marketing Manager,
- **I want** the Google Sheet to be automatically updated with the status of each email sent,
- **so that** I have a real-time view of the campaign's progress.

## Acceptance Criteria

- The email campaign pipeline updates the status of each contact in the Google Sheet to 'Sent' after the email has been successfully sent.
- The update is performed by an asset that depends on the email sending asset.

## Metrics for Success

- **Primary Metric**: 100% of contacts who are sent an email have their status updated to 'Sent' in the Google Sheet within 1 minute.
- **Secondary Metrics**: No other data in the Google Sheet is accidentally modified.
