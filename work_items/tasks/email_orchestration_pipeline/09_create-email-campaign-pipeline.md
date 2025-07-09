---
title: 'Create Email Campaign Pipeline'
project_name: dagster_card_processor
epic_name: email_orchestration_pipeline
task_id: 9
story_id: 13
labels: 'backend, dagster, pipeline'
status: 'todo'
date_created: '2025-07-09T12:50:00-07:00'
date_verified_completed: ''
touched: '*'
---

**Description:**

Create a new Dagster pipeline that orchestrates the email campaign. This pipeline will fetch the contact list, filter it, and send the emails.

**Acceptance Criteria:**

- The pipeline is defined in a new file (e.g., `dagster_card_processor/pipelines/email_campaign_pipeline.py`).
- The pipeline includes the assets for reading the Google Sheet, filtering the contacts, and sending the emails.
- The pipeline has a configuration option to enable/disable "dry-run" mode.
