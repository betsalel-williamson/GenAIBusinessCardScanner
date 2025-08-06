---
id: task-16
title: Integrate Postmark Template Sending
status: todo
assignee: []
created_date: '2025-08-06 21:32'
updated_date: '2025-08-06 21:32'
labels:
  - 'project:dagster_project'
  - 'epic:email_sending_service'
  - 'type:task'
  - 'original_id:09'
  - backend
  - email
  - postmark
dependencies: []
---

## Description

Integrate the Postmark sendEmailWithTemplate method into the main application flow.

## Acceptance Criteria

- [ ] The Dagster asset/op uses sendEmailWithTemplate
- [ ] The TemplateModel is correctly populated with a lead's data
- [ ] The action_url in the TemplateModel is the personalized URL from the URL generation logic.
