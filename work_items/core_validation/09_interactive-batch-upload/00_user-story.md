---
title: 'Interactive Single Card Processing with Batch Upload'
project_name: validation_tool.ts
epic_name: core_validation
story_id: 9
labels: 'frontend, backend, workflow'
status: 'todo'
date_created: '2025-07-18T10:00:00-07:00'
date_verified_completed: ''
touched: '*'
---

- **As a** Data Operator,
- **I want to** upload one or more business card PDFs directly through the web application, have them processed sequentially, and be taken to the validation screen for each card as it completes,
- **so that** I can efficiently work through a batch of cards with a focused, single-piece flow for validation.

## Acceptance Criteria

- The web application has a file upload component that accepts multiple PDF files.
- Uploading files adds them to a processing queue visible in the UI.
- The system processes one card from the queue at a time using the existing AI data extraction pipeline.
- After each card is processed, the user is notified and can immediately navigate to the side-by-side validation view for that card.
- The user sees the status of each file in the queue (e.g., "Waiting", "Processing", "Ready for Review", "Error").
- The application should handle processing errors gracefully and report them to the user for the specific file that failed.

## Metrics for Success

- **Primary Metric**: Time from finishing one validation to starting the next is less than 5 seconds.
- **Secondary Metrics**: User can successfully upload and process a batch of 10 cards without errors.
