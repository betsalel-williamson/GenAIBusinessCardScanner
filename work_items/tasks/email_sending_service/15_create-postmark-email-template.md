---
title: 'Create Postmark Email Template'
project_name: dagster_card_processor
epic_name: email_sending_service
task_id: 10
labels: 'email, postmark, design'
status: 'todo'
date_created: '2025-07-09T13:15:00-07:00'
date_verified_completed: ''
touched: '*'
---

## Task

Create and configure the email template in the Postmark web UI.

## Acceptance Criteria

- [ ] A template with the alias `b2b-opt-in` is created in Postmark.
- [ ] The template includes merge tags for all required personalization fields (`name`, `company_name`, etc.).
- [ ] The template's call-to-action button uses the `{{action_url}}` merge tag.

## Context/Links

- Related user story: [../user_stories/email_sending_service/12_send-templated-emails.md](./../user_stories/email_sending_service/12_send-templated-emails.md)
