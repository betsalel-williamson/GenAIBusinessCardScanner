---
title: 'Committing a Validated Record'
project_name: validation_tool.ts
epic_name: core_validation
story_id: 6
labels: 'frontend, validation, workflow'
status: 'done'
date_created: '2025-06-17T11:39:41-07:00'
date_verified_completed: '2025-06-22T10:10:33-07:00'
touched: '**'
---

- **As a** Data Operator,
- **I want to** formally "Commit" a record once I am satisfied with its accuracy,
- **so that** I can mark it as ready for final processing and move to the next task.

## Acceptance Criteria

- A "Commit & Next" button is clearly visible.
- A dialog to confirm we are ready is displayed to ensure that we are actually done.
- Clicking it updates the record's status to `validated` in the database.
- The system automatically loads the next record that "Needs Validation" to maintain workflow momentum.
- If no records are left, a clear message is displayed.

## Metrics for Success

- **Primary Metric**: Time between committing one record and the next record loading is less than 1 second.
- **Secondary Metrics**: Rate of re-opening validated records is less than 1%.
