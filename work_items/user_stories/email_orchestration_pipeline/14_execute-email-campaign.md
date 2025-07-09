---
title: 'Execute Email Campaign'
project_name: dagster_card_processor
epic_name: email_orchestration_pipeline
story_id: 14
labels: 'backend, dagster, workflow'
status: 'todo'
date_created: '2025-07-09T12:50:00-07:00'
date_verified_completed: ''
touched: '*'
---

- **As a** Marketing Manager,
- **I want** to execute the email campaign,
- **so that** I can send outreach emails to the designated contacts.

## Acceptance Criteria

- The email campaign pipeline can be triggered in a "live" mode.
- In "live" mode, the pipeline sends emails to the contacts in the outreach list.
- The pipeline uses the Postmark resource in its production configuration.

## Metrics for Success

- **Primary Metric**: 100% of contacts in the outreach list are sent an email.
- **Secondary Metrics**: The campaign for 1,000 contacts is completed in under 10 minutes.
