# Task: Implement Feature-Based Work Item Organization

**Objective:** Establish and implement a new organizational structure for work item documentation (tasks and user stories) by creating feature-specific directories under `.work-items/`.

**Acceptance Criteria:**

* A clear directory structure is defined for feature-based work items.
* Guidelines for creating new feature directories and placing `task.md` and `user_story.md` files within them are documented.
* Existing work item documentation is moved into their respective feature directories.
* All internal links or references to moved work item files are updated to reflect their new paths.

**Requirements Traceability:** This task improves the organization and discoverability of work item documentation, aligning with best practices for project management.

**Test Strategy:**

1. Verify the new directory structure using `ls -R .work-items/`.
2. Confirm all work item files are present in their new locations and absent from old locations.
3. Check for any broken links or references to moved files (manual inspection or a link checker if available).

---

## Existing Work Item Documentation to be Moved

The following files need to be moved into their respective feature directories under `.work-items/`:

### Tasks

* `.work-items/tasks/refactoring/11_migrate-test-files.md`
* `.work-items/tasks/platform_engineering/03_verify-local-prod-build.md`
* `.work-items/tasks/platform_engineering/02_update-package-json-scripts.md`
* `.work-items/tasks/platform_engineering/01_refactor-server-ts-dev-only.md`
* `.work-items/tasks/platform_engineering/01_document-accepted-vulnerabilities.md`
* `.work-items/tasks/platform_engineering/00_integrate-trivy-scan.md`
* `.work-items/tasks/platform_engineering/00_implement-pre-commit-hooks.md`
* `.work-items/tasks/platform_engineering/00_create-server-prod-ts.md`
* `.work-items/tasks/pipeline_robustness/03_update_development_environment_setup.md`
* `.work-items/tasks/pipeline_robustness/02_configure_persistent_local_production_environment.md`
* `.work-items/tasks/pipeline_robustness/01_implement_file_archiving_asset.md`
* `.work-items/tasks/interactive_batch_upload/10_develop-frontend-upload-component.md`
* `.work-items/tasks/google_sheets_integration/06_add-unit-tests-for-update-method.md`
* `.work-items/tasks/google_sheets_integration/05_add-update-method-to-google-sheets-resource.md`
* `.work-items/tasks/google_sheets_integration/04_add-unit-tests-for-filter-contacts-asset.md`
* `.work-items/tasks/google_sheets_integration/03_create-filter-contacts-asset.md`
* `.work-items/tasks/google_sheets_integration/02_add-unit-tests-for-google-sheets-resource.md`
* `.work-items/tasks/google_sheets_integration/01_create-google-sheets-resource.md`
* `.work-items/tasks/email_sending_service/15_create-postmark-email-template.md`
* `.work-items/tasks/email_sending_service/14_integrate-postmark-template-sending.md`
* `.work-items/tasks/email_sending_service/08_add-unit-tests-for-postmark-resource.md`
* `.work-items/tasks/email_sending_service/07_create-postmark-resource.md`
* `.work-items/tasks/email_orchestration_pipeline/16_verify-shopify-form-fill-script.md`
* `.work-items/tasks/email_orchestration_pipeline/13_develop-url-generation-logic.md`
* `.work-items/tasks/email_orchestration_pipeline/12_create-dbt-models-for-lead-data.md`
* `.work-items/tasks/email_orchestration_pipeline/11_implement-send-once-logic.md`
* `.work-items/tasks/email_orchestration_pipeline/10_add-integration-tests-for-email-campaign-pipeline.md`
* `.work-items/tasks/email_orchestration_pipeline/09_create-email-campaign-pipeline.md`
* `.work-items/tasks/documentation_management/00_migrate_docs_to_backlog_md.md`
* `.work-items/tasks/documentation/01_doc_reorg_genai_submodule.md`
* `.work-items/tasks/documentation/00_docker-build-publish-docs.md`
* `.work-items/tasks/developer_experience_improvements/02_implement-incremental-ci-builds.md`
* `.work-items/tasks/developer_experience_improvements/01_implement-index-ts-for-imports.md`
* `.work-items/tasks/developer_experience_improvements/00_implement-lint-staged.md`
* `.work-items/tasks/data_ingestion_and_export/00_implement-robust-ingestion-export.md`

### User Stories

* `.work-items/user_stories/platform_engineering/00_automated-vulnerability-scanning-in-ci/01_design-spec.md`
* `.work-items/user_stories/platform_engineering/00_automated-vulnerability-scanning-in-ci/00_user-story.md`
* `.work-items/user_stories/pipeline_robustness/00_robust_file_processing_and_environment_management.md`
* `.work-items/user_stories/ingestion_and_workflow/02_viewing-queue.md`
* `.work-items/user_stories/ingestion_and_workflow/01_uploading-cards.md`
* `.work-items/user_stories/google_sheets_integration/11_update-contact-status.md`
* `.work-items/user_stories/google_sheets_integration/10_filter-contact-list.md`
* `.work-items/user_stories/google_sheets_integration/09_use-google-sheet-as-contact-source.md`
* `.work-items/user_stories/email_sending_service/12_send-templated-emails.md`
* `.work-items/user_stories/email_orchestration_pipeline/16_prevent-duplicate-email-sends.md`
* `.work-items/user_stories/email_orchestration_pipeline/15_update-google-sheet-with-campaign-progress.md`
* `.work-items/user_stories/email_orchestration_pipeline/14_execute-email-campaign.md`
* `.work-items/user_stories/email_orchestration_pipeline/13_run-email-campaigns-in-test-mode.md`
* `.work-items/user_stories/documentation/00_comprehensive-docker-documentation/01_design-spec.md`
* `.work-items/user_stories/documentation/00_comprehensive-docker-documentation/00_user-story.md`
* `.work-items/user_stories/data_finalization/08_accessing-clean-data.md`
* `.work-items/user_stories/data_finalization/07_automated-pipeline.md`
* `.work-items/user_stories/data_extraction/00_ai-extraction.md`
* `.work-items/user_stories/core_validation/06_committing-record.md`
* `.work-items/user_stories/core_validation/05_reverting-edits.md`
* `.work-items/user_stories/core_validation/04_correcting-data.md`
* `.work-items/user_stories/core_validation/03_side-by-side-view.md`

---

## Proposed Post-Migration Structure

Once the migration is complete, the `.work-items/` directory will be organized into feature-specific subdirectories. Each feature directory will contain its associated `task.md` and `user_story.md` (if applicable) files. The goal is to group related work items together for better clarity and management.

Here's an example of how the `.work-items/` directory will look after the migration:

```txt
/.work-items/
├── core_validation/
│   ├── task.md (e.g., for 03_side-by-side-view.md, 04_correcting-data.md, etc.)
│   └── user_story.md (e.g., for 03_side-by-side-view.md, 04_correcting-data.md, etc.)
├── data_extraction/
│   ├── task.md
│   └── user_story.md (e.g., for 00_ai-extraction.md)
├── data_finalization/
│   ├── task.md
│   └── user_story.md (e.g., for 07_automated-pipeline.md, 08_accessing-clean-data.md)
├── data_ingestion_and_export/
│   └── task.md (e.g., for 00_implement-robust-ingestion-export.md)
├── developer_experience_improvements/
│   └── task.md (e.g., for 00_implement-lint-staged.md, 01_implement-index-ts-for-imports.md, etc.)
├── documentation/
│   ├── task.md (e.g., for 00_docker-build-publish-docs.md, 01_doc_reorg_genai_submodule.md)
│   └── user_story.md (e.g., for 00_comprehensive-docker-documentation/00_user-story.md, etc.)
├── documentation_management/
│   └── task.md (e.g., for 00_migrate_docs_to_backlog_md.md)
├── email_orchestration_pipeline/
│   ├── task.md (e.g., for 09_create-email-campaign-pipeline.md, 10_add-integration-tests-for-email-campaign-pipeline.md, etc.)
│   └── user_story.md (e.g., for 13_run-email-campaigns-in-test-mode.md, 14_execute-email-campaign.md, etc.)
├── email_sending_service/
│   ├── task.md (e.g., for 07_create-postmark-resource.md, 08_add-unit-tests-for-postmark-resource.md, etc.)
│   └── user_story.md (e.g., for 12_send-templated-emails.md)
├── generative_ai_library_migration/
│   └── task.md (the task we just created)
├── google_sheets_integration/
│   ├── task.md (e.g., for 01_create-google-sheets-resource.md, 02_add-unit-tests-for-google-sheets-resource.md, etc.)
│   └── user_story.md (e.g., for 09_use-google-sheet-as-contact-source.md, 10_filter-contact-list.md, etc.)
├── ingestion_and_workflow/
│   ├── task.md
│   └── user_story.md (e.g., for 01_uploading-cards.md, 02_viewing-queue.md)
├── interactive_batch_upload/
│   └── task.md (e.g., for 10_develop-frontend-upload-component.md)
├── migrate-docs-to-feature-folders/
│   └── task.md (this task)
├── pipeline_robustness/
│   ├── task.md (e.g., for 01_implement_file_archiving_asset.md, 02_configure_persistent_local_production_environment.md, etc.)
│   └── user_story.md (e.g., for 00_robust_file_processing_and_environment_management.md)
├── platform_engineering/
│   ├── task.md (e.g., for 00_create-server-prod-ts.md, 00_implement-pre-commit-hooks.md, etc.)
│   └── user_story.md (e.g., for 00_automated-vulnerability-scanning-in-ci/00_user-story.md, etc.)
└── refactoring/
    └── task.md (e.g., for 11_migrate-test-files.md)
```
