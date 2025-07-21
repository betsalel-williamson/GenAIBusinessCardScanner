---
title: 'Implement File Archiving Asset'
project_name: dagster-card-processor
epic_name: pipeline_robustness
task_id: 00_pipeline_robustness/01_implement_file_archiving_asset
labels: data-pipeline, assets
status: todo
date_created: 2025-07-10T12:05:00-07:00
date_verified_completed: ''
touched: '*'
---

## Task

Create a new Dagster asset responsible for moving successfully processed PDF files from the input directory to a designated archive directory.

## Acceptance Criteria

- [ ] A new asset `archive_processed_file` is created.
- [ ] The `archive_processed_file` asset takes the path of the processed PDF as input.
- [ ] The asset successfully moves the input PDF file from `cards_to_process` to `cards_processed`.
- [ ] The `process_all_assets_job` is updated to include `archive_processed_file` as a dependency of `processed_card_json`.
- [ ] Unit tests are added for the `archive_processed_file` asset.

## Context/Links

- Related user story: ../../user_stories/pipeline_robustness/00_robust_file_processing_and_environment_management.md
