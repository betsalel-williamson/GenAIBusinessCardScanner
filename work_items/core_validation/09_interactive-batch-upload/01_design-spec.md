---
title: 'Design Spec: Interactive Single Card Processing with Batch Upload'
project_name: validation_tool.ts
epic_name: core_validation
story_id: 9
spec_id: 1
status: 'draft'
date_created: '2025-07-18T13:00:00-07:00'
date_approved: ''
touched: '**'
---

## 1. Objective

To create a seamless, single-piece flow for users to upload and validate business cards by implementing a real-time, interactive processing queue in the web application.

## 2. Technical Design

The solution will leverage the existing file upload component and backend API. The core of this design is the introduction of a **Server-Sent Events (SSE)** communication channel to provide real-time feedback to the user on the status of their uploaded files.

### High-Level Flow

1.  **User Uploads Files:** The user selects one or more PDF/image files using the existing `FileUpload.tsx` component.
2.  **Backend Receives Files:** The Express server receives the files via the `/api/upload` endpoint, saves them to the `cards_to_process` directory, which triggers the existing Dagster sensor.
3.  **SSE Connection:** Upon upload, the frontend establishes an SSE connection to a new server endpoint using the native `EventSource` API.
4.  **Dagster Pipeline Emits Events:** The Dagster pipeline will be modified to emit events at key stages of the process (e.g., `processing_started`, `processing_complete`, `processing_error`).
5.  **Backend Relays Events:** The Express server's SSE endpoint will subscribe to a Redis pub/sub channel. The Dagster pipeline will publish events to this channel.
6.  **Frontend Updates UI:** The `FileUpload.tsx` component listens for SSE messages and updates the UI in real-time.

## 3. Key Changes

### 3.1. API Contracts

*   **New SSE Endpoint:** A new endpoint (e.g., `/api/status`) will be created on the Express server to handle SSE connections.
*   **SSE Message Format:** The server will send events with the following JSON data format:
    ```json
    {
      "fileId": "<unique_file_identifier>",
      "status": "<processing|ready_for_review|error>",
      "message": "<optional_error_message>"
    }
    ```

### 3.2. Data Models

No changes to the database schema are anticipated.

### 3.3. Component Responsibilities

*   **`FileUpload.tsx` (Frontend):**
    *   Will be modified to establish and manage an SSE connection via the `EventSource` API.
    *   Will update the UI based on messages received from the SSE endpoint.
    *   Will provide a link to the validation page for files with a `ready_for_review` status.
*   **`server.ts` (Backend):**
    *   Will be modified to include an SSE endpoint to manage client connections.
*   **Dagster Pipeline (Backend):**
    *   Will be modified to emit status events. The exact mechanism (e.g., Redis, file-based status) will be determined during implementation.

## 4. Alternatives Considered

*   **HTTP Polling:** Rejected due to inefficiency and network overhead. It does not provide a truly real-time user experience.
*   **WebSockets:** Considered as an alternative for real-time communication. However, it was deemed overly complex for this use case. Our requirement is for one-way communication (server-to-client), and SSE provides this functionality with a much simpler implementation, using standard HTTP and avoiding the overhead of a new protocol.

## 5. Out of Scope

*   This design does not include a persistent, multi-user queue. The queue is managed in-memory on the server and is tied to a single user's session.
*   This design does not address the long-term storage of processed files.