---
title: 'Update Frontend to Use SSE'
project_name: validation_tool.ts
epic_name: interactive_batch_upload
task_id: 13
story_id: 9
labels: 'frontend, react, sse'
status: 'todo'
date_created: '2025-07-18T13:25:00-07:00'
date_verified_completed: ''
touched: '*'
---

**Description:**

Update the `FileUpload.tsx` component to connect to the new Server-Sent Events (SSE) endpoint and display real-time status updates.

**Acceptance Criteria:**

- The `FileUpload.tsx` component establishes a connection to the `/api/status` endpoint using the `EventSource` API.
- The component listens for messages from the server and updates the status of the corresponding file in the UI.
- When a file's status is `ready_for_review`, a link to the validation page is displayed.
- The connection is closed gracefully when the component unmounts.
