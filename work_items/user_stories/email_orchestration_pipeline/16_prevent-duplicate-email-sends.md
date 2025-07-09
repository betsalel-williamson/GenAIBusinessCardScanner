---
title: 'Prevent Duplicate Email Sends'
project_name: dagster_card_processor
epic_name: email_orchestration_pipeline
story_id: 16
labels: 'backend, dagster, data-integrity'
status: 'todo'
date_created: '2025-07-09T13:00:00-07:00'
date_verified_completed: ''
touched: '*'
---

- **As a** Marketing Manager,
- **I want to** ensure that each contact receives only one invitation email,
- **so that** we maintain a professional relationship and avoid spamming.

## Acceptance Criteria

- The system tracks which contacts have already received an email.
- The email sending process automatically filters out contacts who have already been sent an email.
- The system is robust against re-runs, ensuring no duplicate emails are sent even if the pipeline is executed multiple times.

## Metrics for Success

- **Primary Metric**: Zero duplicate emails are sent to any contact.
- **Secondary Metrics**: The system can identify and skip previously sent contacts efficiently.
