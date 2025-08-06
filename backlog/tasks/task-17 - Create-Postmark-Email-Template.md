---
id: task-17
title: Create Postmark Email Template
status: todo
assignee: []
created_date: '2025-08-06 21:33'
updated_date: '2025-08-06 21:33'
labels:
  - 'project:dagster_project'
  - 'epic:email_sending_service'
  - 'type:task'
  - 'original_id:10_email_template'
  - email
  - postmark
  - design
dependencies: []
---

## Description

Create and configure the email template in the Postmark web UI.

## Acceptance Criteria

- [ ] A template with the alias b2b-opt-in is created in Postmark
- [ ] The template includes merge tags for all required personalization fields (name
- [ ] company_name
- [ ] etc.)
- [ ] The template's call-to-action button uses the {{action_url}} merge tag.
