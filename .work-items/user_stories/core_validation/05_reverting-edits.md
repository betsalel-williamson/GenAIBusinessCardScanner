---
title: 'Reverting Incorrect Edits'
project_name: validation_tool.ts
epic_name: core_validation
story_id: 5
labels: 'frontend, validation, undo'
status: 'done'
date_created: '2025-06-17T11:39:41-07:00'
date_verified_completed: '2025-06-22T10:10:33-07:00'
touched: '**'
---

- **As a** Data Operator,
- **I want to** be able to revert a single field back to its original AI-extracted value,
- **so that** I can quickly undo a specific mistake without losing other corrections I've made to the record.

## Acceptance Criteria

- Each field has a "Revert" button.
- Clicking "Revert" restores only that field's value to what the AI originally provided.
- The system also supports a global undo/redo for my session edits.

## Metrics for Success

- **Primary Metric**: Time to revert a field is less than 2 seconds.
- **Secondary Metrics**: Accidental data loss incidents are zero.
