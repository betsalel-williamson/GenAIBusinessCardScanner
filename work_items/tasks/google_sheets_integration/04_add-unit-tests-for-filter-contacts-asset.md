---
title: 'Add Unit Tests for Filter Contacts Asset'
project_name: dagster_card_processor
epic_name: google_sheets_integration
task_id: 4
story_id: 10
labels: 'backend, dagster, testing'
status: 'todo'
date_created: '2025-07-09T12:35:00-07:00'
date_verified_completed: ''
touched: '*'
---

**Description:**

Add unit tests for the `filter_contacts` asset to ensure it correctly filters the contact list.

**Acceptance Criteria:**

- A new test file is created (e.g., `dagster_card_processor/tests/test_email_outreach_assets.py`).
- The tests use a sample contact list as input.
- The tests verify that the asset correctly identifies contacts to be included and excluded based on the filter criteria.
- The tests verify that the asset handles an empty input list gracefully.
