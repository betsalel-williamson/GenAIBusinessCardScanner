---
title: 'Develop URL Generation Logic'
project_name: dagster_card_processor
epic_name: email_orchestration_pipeline
task_id: 13
story_id: 12
labels: 'backend, url, personalization'
status: 'todo'
date_created: '2025-07-09T13:05:00-07:00'
date_verified_completed: ''
touched: '*'
---

## Task

Create a function to build a pre-filled form URL from a lead's data.

## Acceptance Criteria

- [ ] A function `buildOptInUrl(baseUrl, leadData)` is created (this will be a Python function/asset).
- [ ] The function correctly encodes all lead data as query parameters.
- [ ] The function includes the required UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`).

## Context/Links

- Related user story: [../user_stories/email_sending_service/12_send-templated-emails.md](./../user_stories/email_sending_service/12_send-templated-emails.md)
