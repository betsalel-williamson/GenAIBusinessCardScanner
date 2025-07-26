---
title: 'Run Email Campaigns in Test Mode'
project_name: dagster_project
epic_name: email_orchestration_pipeline
story_id: 13
labels: 'backend, dagster, workflow'
status: 'todo'
date_created: '2025-07-09T12:50:00-07:00'
date_verified_completed: ''
touched: '*'
---

- **As a** Marketing Manager,
- **I want** to run email campaigns in a "test mode",
- **so that** I can verify the recipient list and email content before sending anything to actual clients.

## Acceptance Criteria

- A new Dagster pipeline is created for orchestrating email campaigns.
- The pipeline has a "dry-run" mode that is enabled by default.
- In "dry-run" mode, the pipeline logs the emails that would be sent, but does not actually send them.
- The pipeline uses the Postmark resource in its development/test configuration.

## Metrics for Success

- **Primary Metric**: 100% of test runs produce a log of intended emails without sending any actual emails.
- **Secondary Metrics**: The test run completes in under 30 seconds for a list of 100 contacts.
