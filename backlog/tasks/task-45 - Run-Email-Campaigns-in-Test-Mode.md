---
id: task-45
title: Run Email Campaigns in Test Mode
status: todo
assignee: []
created_date: '2025-08-06 21:41'
updated_date: '2025-08-06 21:41'
labels:
  - 'project:dagster_project'
  - 'epic:email_orchestration_pipeline'
  - 'type:user-story'
  - 'original_id:13'
  - backend
  - dagster
  - workflow
dependencies: []
---

## Description

- **As a** Marketing Manager, - **I want** to run email campaigns in a "test mode", - **so that** I can verify the recipient list and email content before sending anything to actual clients. ## Metrics for Success - **Primary Metric**: 100% of test runs produce a log of intended emails without sending any actual emails. - **Secondary Metrics**: The test run completes in under 30 seconds for a list of 100 contacts.

## Acceptance Criteria

- [ ] A new Dagster pipeline is created for orchestrating email campaigns
- [ ] The pipeline has a "dry-run" mode that is enabled by default
- [ ] In "dry-run" mode
- [ ] the pipeline logs the emails that would be sent
- [ ] but does not actually send them
- [ ] The pipeline uses the Postmark resource in its development/test configuration.
