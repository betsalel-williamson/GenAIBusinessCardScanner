---
title: 'Migrate Test Files to Co-location'
project_name: validation_tool.ts
epic_name: refactoring
task_id: 11
story_id:
labels: 'refactoring, testing'
status: 'verified completed'
date_created: '2025-07-18T12:15:00-07:00'
date_verified_completed: 'Mon Jul 21 16:18:01 PDT 2025'
touched: '**'
---

**Description:**

Migrate the test files from the `src/__tests__` directory to be co-located with the files they are testing. For example, `src/src/__tests__components/FileUpload.test.tsx` should be moved to `src/client/components/FileUpload.test.tsx`.

**Acceptance Criteria:**

- All test files are moved to be next to the files they are testing.
- The `src/__tests__` directory is removed.
- All tests pass after the migration.
