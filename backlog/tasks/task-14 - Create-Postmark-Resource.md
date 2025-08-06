---
id: task-14
title: Create Postmark Resource
status: todo
assignee: []
created_date: '2025-08-06 21:32'
updated_date: '2025-08-06 21:32'
labels:
  - 'project:dagster_project'
  - 'epic:email_sending_service'
  - 'type:task'
  - 'original_id:7'
  - 'story_id:12'
  - backend
  - dagster
  - resource
dependencies: []
---

## Description

Create a new Dagster resource that encapsulates the logic for sending emails via the Postmark API.

## Acceptance Criteria

- [ ] The resource is defined in its own file (e.g.
- [ ] dagster_project/resources/postmark_resource.py)
- [ ] The resource is configurable with the Postmark API key
- [ ] The resource has a method send_email(recipient
- [ ] subject
- [ ] body)
- [ ] The resource supports both development (using a "test" API key that doesn't actually send emails) and production environments.
