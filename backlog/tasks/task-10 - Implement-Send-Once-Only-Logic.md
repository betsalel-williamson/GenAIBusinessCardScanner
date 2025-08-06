---
id: task-10
title: Implement Send-Once-Only Logic
status: todo
assignee: []
created_date: '2025-08-06 21:31'
updated_date: '2025-08-06 21:31'
labels:
  - 'project:dagster_project'
  - 'epic:email_orchestration_pipeline'
  - 'type:task'
  - 'original_id:11'
  - 'story_id:16'
  - backend
  - dbt
  - dagster
  - data-integrity
dependencies: []
---

## Description

Implement a mechanism to ensure that a one-time marketing email is sent to each lead only once. This is a critical business requirement to maintain a professional relationship with potential customers.

## Acceptance Criteria

- [ ] A persistent storage layer (e.g.
- [ ] a new dbt model or a separate table) is created to track sent emails. This table should at a minimum store the lead's email address and a timestamp of when the email was sent
- [ ] The dbt transformation logic is updated to flag leads that have already been contacted
- [ ] The Dagster asset/op that sends emails is updated to filter out leads that have already been flagged as contacted
- [ ] The system is tested to ensure that if the pipeline is run multiple times
- [ ] it does not send duplicate emails to the same lead.
