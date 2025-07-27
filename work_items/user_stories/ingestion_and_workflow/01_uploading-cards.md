---
title: 'Uploading Business Cards'
project_name: validation_tool.ts
epic_name: ingestion_and_workflow
story_id: 1
labels: 'frontend, upload, workflow'
status: 'done'
date_created: '2025-06-17T11:39:41-07:00'
date_verified_completed: '2025-06-22T10:10:33-07:00'
touched: '**'
---

- **As a** Data Operator,
- **I want to** upload one or more PDF business cards through the web interface,
- **so that** they can be queued for AI processing without me needing to access the server's file system.

## Acceptance Criteria

- The homepage displays a file upload area (e.g., button, drag-and-drop zone).
- I can select multiple PDF files at once from my local machine.
- The UI provides clear feedback for each file's upload status (success, failure, in-progress).
- Successfully uploaded PDFs are stored in the `image_data_source` directory for Dagster to detect.

## Metrics for Success

- **Primary Metric**: Time to upload 10 PDFs is under 15 seconds.
- **Secondary Metrics**: Upload success rate is > 99%.
