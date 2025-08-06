---
id: task-54
title: Viewing the Work Queue
status: done
assignee: []
created_date: '2025-08-06 21:43'
updated_date: '2025-08-06 21:43'
labels:
  - 'project:validation_tool.ts'
  - 'epic:ingestion_and_workflow'
  - 'type:user-story'
  - 'original_id:2'
  - frontend
  - workflow
  - dashboard
dependencies: []
---

## Description

- **As a** Data Operator, - **I want to** see a list of all business cards in the system and their real-time status (e.g., "Processing with AI", "Needs Validation", "Validated", "Complete"), - **so that** I can understand the overall progress and select a card to work on. ## Acceptance Criteria - The homepage displays a list or table of all individual records. - Each record shows a unique identifier and its current status. - The list updates automatically or with a refresh to show newly processed cards. - I can filter the list to show only records that require my attention ("Needs Validation"). - On the validating page, we show a simple, minimal progress bar at the bottom of the page, with a tooltip with details. ## Metrics for Success - **Primary Metric**: Time to find a specific record in the queue is less than 5 seconds. - **Secondary Metrics**: The status of a record updates in the UI within 2 seconds of the backend change.

## Acceptance Criteria

- [ ] The homepage displays a list or table of all individual records
- [ ] Each record shows a unique identifier and its current status
- [ ] The list updates automatically or with a refresh to show newly processed cards
- [ ] I can filter the list to show only records that require my attention ("Needs Validation")
- [ ] On the validating page
- [ ] we show a simple
- [ ] minimal progress bar at the bottom of the page
- [ ] with a tooltip with details.
