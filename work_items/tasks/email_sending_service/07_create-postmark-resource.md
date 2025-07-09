---
title: 'Create Postmark Resource'
project_name: dagster_card_processor
epic_name: email_sending_service
task_id: 7
story_id: 12
labels: 'backend, dagster, resource'
status: 'todo'
date_created: '2025-07-09T12:45:00-07:00'
date_verified_completed: ''
touched: '*'
---

**Description:**

Create a new Dagster resource that encapsulates the logic for sending emails via the Postmark API.

**Acceptance Criteria:**

- The resource is defined in its own file (e.g., `dagster_card_processor/resources/postmark_resource.py`).
- The resource is configurable with the Postmark API key.
- The resource has a method `send_email(recipient, subject, body)`.
- The resource supports both development (using a "test" API key that doesn't actually send emails) and production environments.
