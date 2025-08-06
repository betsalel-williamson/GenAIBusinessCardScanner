---
id: task-38
title: Reverting Incorrect Edits
status: done
assignee: []
created_date: '2025-08-06 21:38'
updated_date: '2025-08-06 21:38'
labels:
  - 'project:validation_tool.ts'
  - 'epic:core_validation'
  - 'type:user-story'
  - 'original_id:5'
  - frontend
  - validation
  - undo
dependencies: []
---

## Description

- **As a** Data Operator, - **I want to** be able to revert a single field back to its original AI-extracted value, - **so that** I can quickly undo a specific mistake without losing other corrections I've made to the record. ## Metrics for Success - **Primary Metric**: Time to revert a field is less than 2 seconds. - **Secondary Metrics**: Accidental data loss incidents are zero.

## Acceptance Criteria

- [ ] Each field has a "Revert" button
- [ ] Clicking "Revert" restores only that field's value to what the AI originally provided
- [ ] The system also supports a global undo/redo for my session edits.
