---
title: 'Integrate Postmark Template Sending'
project_name: dagster_project
epic_name: email_sending_service
task_id: 09
labels: 'backend, email, postmark'
status: 'todo'
date_created: '2025-07-09T13:10:00-07:00'
date_verified_completed: ''
touched: '*'
---

## Task

Integrate the Postmark `sendEmailWithTemplate` method into the main application flow.

## Acceptance Criteria

- [ ] The Dagster asset/op uses `sendEmailWithTemplate`.
- [ ] The `TemplateModel` is correctly populated with a lead's data.
- [ ] The `action_url` in the `TemplateModel` is the personalized URL from the URL generation logic.

## Context/Links

- Related user story: [../user_stories/email_sending_service/12_send-templated-emails.md](./../user_stories/email_sending_service/12_send-templated-emails.md)
