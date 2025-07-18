---
title: 'Create Server-Sent Events (SSE) Endpoint'
project_name: validation_tool.ts
epic_name: interactive_batch_upload
task_id: 12
story_id: 9
labels: 'backend, sse, api'
status: 'todo'
date_created: '2025-07-18T13:20:00-07:00'
date_verified_completed: ''
touched: '*'
---

**Description:**

Create a new Server-Sent Events (SSE) endpoint on the Express server to provide real-time status updates to the client.

**Acceptance Criteria:**

- A new file `src/server/routes/status.ts` is created.
- The new route is added to `src/server/api.ts`.
- The endpoint correctly establishes and maintains an SSE connection.
- The endpoint will subscribe to a Redis pub/sub channel to receive status updates from the Dagster pipeline.
