---
id: task-25
title: Implement File Archiving Asset
status: todo
assignee: []
created_date: '2025-08-06 21:34'
updated_date: '2025-08-06 21:34'
labels:
  - 'project:dagster-card-processor'
  - 'epic:pipeline_robustness'
  - 'type:task'
  - 'original_id:00_pipeline_robustness/01_implement_file_archiving_asset'
  - data-pipeline
  - assets
dependencies: []
---

## Description

Create a new Dagster asset responsible for moving successfully processed PDF files from the input directory to a designated archive directory.

## Acceptance Criteria

- [ ] A new asset archive_processed_file is created
- [ ] The archive_processed_file asset takes the path of the processed PDF as input
- [ ] The asset successfully moves the input PDF file from image_data_source to cards_processed
- [ ] The process_all_assets_job is updated to include archive_processed_file as a dependency of processed_card_json
- [ ] Unit tests are added for the archive_processed_file asset.
