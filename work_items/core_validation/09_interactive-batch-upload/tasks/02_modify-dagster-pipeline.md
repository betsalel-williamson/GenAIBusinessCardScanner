---
title: 'Modify Dagster Pipeline to Emit Status Events'
project_name: dagster_project
epic_name: interactive_batch_upload
task_id: 14
story_id: 9
labels: 'backend, dagster, events'
status: 'todo'
date_created: '2025-07-18T13:30:00-07:00'
date_verified_completed: ''
touched: '*'
---

**Description:**

Modify the existing Dagster pipeline to emit status events at key stages of the business card processing workflow. These events will be consumed by the backend and relayed to the client via SSE.

**Acceptance Criteria:**

- The Dagster pipeline emits an event when it begins processing a file.
- The Dagster pipeline emits an event when it successfully completes processing a file.
- The Dagster pipeline emits an event if an error occurs during processing.
- Each event includes a unique identifier for the file being processed.
- The mechanism for emitting events will be to publish messages to a Redis pub/sub channel.
