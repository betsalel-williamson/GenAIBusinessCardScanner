---
id: task-39
title: Committing a Validated Record
status: done
assignee: []
created_date: '2025-08-06 21:38'
updated_date: '2025-08-06 21:38'
labels:
  - 'project:validation_tool.ts'
  - 'epic:core_validation'
  - 'type:user-story'
  - 'original_id:6'
  - frontend
  - validation
  - workflow
dependencies: []
---

## Description

- **As a** Data Operator, - **I want to** formally "Commit" a record once I am satisfied with its accuracy, - **so that** I can mark it as ready for final processing and move to the next task. ## Metrics for Success - **Primary Metric**: Time between committing one record and the next record loading is less than 1 second. - **Secondary Metrics**: Rate of re-opening validated records is less than 1%.

## Acceptance Criteria

- [ ] A "Commit & Next" button is clearly visible
- [ ] A dialog to confirm we are ready is displayed to ensure that we are actually done
- [ ] Clicking it updates the record's status to validated in the database
- [ ] The system automatically loads the next record that "Needs Validation" to maintain workflow momentum
- [ ] If no records are left
- [ ] a clear message is displayed.
