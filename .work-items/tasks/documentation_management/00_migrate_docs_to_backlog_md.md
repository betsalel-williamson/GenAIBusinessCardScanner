---
title: 'Migrate existing documentation to Backlog.md'
project_name: 'businessCardGenAI'
epic_name: 'documentation_management'
task_id: 'DOC-001'
labels: 'documentation, migration, backlog'
status: 'in-progress'
date_created: '2025-08-06T12:00:00-07:00'
date_verified_completed: ''
touched: '*'
---

## Task

Migrate all existing tasks, user stories, design specs, architecture documents, and decisions from their current Markdown files into the Backlog.md tool. This involves extracting relevant information and reformatting it to fit the structure and requirements of the Backlog.md agent.

See .claude/agents/project-manager-backlog.md for details on how to use the backlog tool

Make sure to capture meta data informaiton like project, epic, type, as a label.

Be sure to create simple tasks with the minimal necessary information, then update the files directly to add the details. The system doesn't work well to input a lot of text when creating items in backlog.

Preserve the "touched" counter attribute

Reference our existing doc standards and make sure that they "play well" with the new standards -- don't break the new tool, but preserve our standards and information. When in doubt, trust that our standards take precendence.

- genai-docs/architecture-standards.md
- genai-docs/decision-standards.md
- genai-docs/design-spec-standards.md
- genai-docs/task-standards.md
- genai-docs/user-story-standards.md

## Acceptance Criteria

- [ ] All files (user stories, tasks, design specs) in `work_items/` have been migrated to Backlog.md as tasks and labeled appropriately.
- [ ] All documents (e.g., in `docs/architecture/`) have been migrated to Backlog.md as docs.
- [ ] All decision records (e.g., in `docs/decisions/`) have been migrated to Backlog.md as decisions.
- [ ] The migrated entries in Backlog.md accurately reflect the original content and intent.
- [ ] A mapping of original file paths/IDs to new Backlog.md IDs is recorded for dependency re-establishment.
- [ ] The created dates are corrected to match the original create dates
- [ ] The dependencies are all mapped (connect project -> user-story -> design spec -> task in that order )
- [ ] The content is reviewed for consistency and accuracy, lists are multi-line, no duplicate headings, note that the linter will auto format and tell you if there are issues and will help you see if there are any issues `pnpm run markdown-format`
- [ ] All verified completed items are moved to the "backlog/completed" directory
- [ ] All canceled or abandoned items are moved to the "backlog/archive" directory
- [ ] Resolve all accidental duplicate tasks

## Context/Links

- Backlog.md tool: <https://github.com/MrLesk/Backlog.md/blob/main/.claude/agents/project-manager-backlog.md>
- Existing documentation locations:
  - Tasks, user Stories, design specs: `work_items/`
  - Architecture Docs: `docs/architecture/`
  - Decisions: `docs/decisions/`

## Files to Migrate

**Important Note on IDs:** Backlog.md automatically assigns unique IDs to new entries. Therefore, the original `task_id`, `story_id`, `spec_id`, and decision IDs from the source Markdown files will *not* be preserved in Backlog.md. This is expected behavior.

**Dependency Handling:** Dependencies will be re-established *after* all individual items (tasks, user stories, etc.) have been migrated to Backlog.md and have received their new Backlog.md assigned IDs. The original IDs (e.g., `task_id`, `story_id`) will be included in the labels or body of the migrated items to serve as a reference for mapping and recreating dependencies.

### Tasks

**Backlog.md Fields Mapping:**

- `id`: Backlog.md assigned ID (original `task_id` will be used for reference in labels/body if needed)
- `title`: `title`
- `status`: `status`
- `assignee`: (Not in current template, can be added manually or left blank)
- `reporter`: (Not in current template, can be added manually or left blank)
- `createdDate`: `date_created`
- `labels`: `project:project_name`, `epic:epic_name`, `task_id` (original ID for reference), `type:task` (type label)
- `milestone`: (Not in current template, can be added manually or inferred)
- `dependencies`: Derived from `Context/Links` if applicable (to be re-established post-migration using new Backlog.md IDs)
- `body`: `## Task` (description), `## Acceptance Criteria` (comma-separated), `## Implementation Plan`, `## Implementation Notes`
- `touched`: a star is added here every day that we try to work on this

- [x] work_items/tasks/data_ingestion_and_export/00_implement-robust-ingestion-export.md
- [x] work_items/tasks/developer_experience_improvements/00_implement-lint-staged.md
- [x] work_items/tasks/developer_experience_improvements/01_implement-index-ts-for-imports.md
- [x] work_items/tasks/developer_experience_improvements/02_implement-incremental-ci-builds.md
- [x] work_items/tasks/documentation/00_docker-build-publish-docs.md
- [x] work_items/tasks/documentation/01_doc_reorg_genai_submodule.md
- [x] work_items/tasks/email_orchestration_pipeline/09_create-email-campaign-pipeline.md
- [x] work_items/tasks/email_orchestration_pipeline/10_add-integration-tests-for-email-campaign-pipeline.md
- [x] work_items/tasks/email_orchestration_pipeline/11_implement-send-once-logic.md
- [x] work_items/tasks/email_orchestration_pipeline/12_create-dbt-models-for-lead-data.md
- [x] work_items/tasks/email_orchestration_pipeline/13_develop-url-generation-logic.md
- [x] work_items/tasks/email_orchestration_pipeline/16_verify-shopify-form-fill-script.md
- [x] work_items/tasks/email_sending_service/07_create-postmark-resource.md
- [x] work_items/tasks/email_sending_service/08_add-unit-tests-for-postmark-resource.md
- [x] work_items/tasks/email_sending_service/14_integrate-postmark-template-sending.md
- [x] work_items/tasks/email_sending_service/15_create-postmark-email-template.md
- [x] work_items/tasks/google_sheets_integration/01_create-google-sheets-resource.md
- [x] work_items/tasks/google_sheets_integration/02_add-unit-tests-for-google-sheets-resource.md
- [x] work_items/tasks/google_sheets_integration/03_create-filter-contacts-asset.md
- [x] work_items/tasks/google_sheets_integration/04_add-unit-tests-for-filter-contacts-asset.md
- [x] work_items/tasks/google_sheets_integration/05_add-update-method-to-google-sheets-resource.md
- [x] work_items/tasks/google_sheets_integration/06_add-unit-tests-for-update-method.md
- [x] work_items/tasks/interactive_batch_upload/10_develop-frontend-upload-component.md
- [x] work_items/tasks/pipeline_robustness/01_implement_file_archiving_asset.md
- [x] work_items/tasks/pipeline_robustness/02_configure_persistent_local_production_environment.md
- [x] work_items/tasks/pipeline_robustness/03_update_development_environment_setup.md
- [x] work_items/tasks/platform_engineering/00_create-server-prod-ts.md
- [x] work_items/tasks/platform_engineering/00_implement-pre-commit-hooks.md
- [x] work_items/tasks/platform_engineering/00_integrate-trivy-scan.md
- [x] work_items/tasks/platform_engineering/01_document-accepted-vulnerabilities.md
- [x] work_items/tasks/platform_engineering/01_refactor-server-ts-dev-only.md
- [x] work_items/tasks/platform_engineering/02_update-package-json-scripts.md
- [x] work_items/tasks/platform_engineering/03_verify-local-prod-build.md
- [x] work_items/tasks/refactoring/11_migrate-test-files.md

### User Stories

**Backlog.md Fields Mapping:**

- `id`: Backlog.md assigned ID (original `story_id` will be used for reference in labels/body if needed)
- `title`: `title`
- `status`: `status`
- `assignee`: (Not in current template, can be added manually or left blank)
- `reporter`: (Not in current template, can be added manually or left blank)
- `createdDate`: `date_created`
- `labels`: `project:project_name`, `epic:epic_name`, `type:user-story` (type label)
- `milestone`: (Not in current template, can be added manually or inferred)
- `dependencies`: Derived from `Context/Links` if applicable (to be re-established post-migration using new Backlog.md IDs)
- `body`: `## User Story` (description), `## Acceptance Criteria` (comma-separated)
- `touched`: a star is added here every day that we try to work on this

- [x] work_items/user_stories/core_validation/03_side-by-side-view.md
- [x] work_items/user_stories/core_validation/04_correcting-data.md
- [x] work_items/user_stories/core_validation/05_reverting-edits.md
- [x] work_items/user_stories/core_validation/06_committing-record.md
- [x] work_items/user_stories/data_extraction/00_ai-extraction.md
- [x] work_items/user_stories/data_finalization/07_automated-pipeline.md
- [x] work_items/user_stories/data_finalization/08_accessing-clean-data.md
- [x] work_items/user_stories/documentation/00_comprehensive-docker-documentation/00_user-story.md
- [x] work_items/user_stories/documentation/00_comprehensive-docker-documentation/01_design-spec.md
- [x] work_items/user_stories/email_orchestration_pipeline/13_run-email-campaigns-in-test-mode.md
- [x] work_items/user_stories/email_orchestration_pipeline/14_execute-email-campaign.md
- [x] work_items/user_stories/email_orchestration_pipeline/15_update-google-sheet-with-campaign-progress.md
- [x] work_items/user_stories/email_orchestration_pipeline/16_prevent-duplicate-email-sends.md
- [x] work_items/user_stories/email_sending_service/12_send-templated-emails.md
- [x] work_items/user_stories/google_sheets_integration/09_use-google-sheet-as-contact-source.md
- [x] work_items/user_stories/google_sheets_integration/10_filter-contact-list.md
- [x] work_items/user_stories/google_sheets_integration/11_update-contact-status.md
- [x] work_items/user_stories/ingestion_and_workflow/01_uploading-cards.md
- [x] work_items/user_stories/ingestion_and_workflow/02_viewing-queue.md
- [x] work_items/user_stories/pipeline_robustness/00_robust_file_processing_and_environment_management.md
- [x] work_items/user_stories/platform_engineering/00_automated-vulnerability-scanning-in-ci/00_user-story.md
- [x] work_items/user_stories/platform_engineering/00_automated-vulnerability-scanning-in-ci/01_design-spec.md

### Design Specs

**Backlog.md Fields Mapping (as Document type):**

- `id`: Backlog.md assigned ID (original `spec_id` will be used for reference in tags/body if needed)
- `title`: `title`
- `type`: `design-spec`
- `createdDate`: `date_created`
- `updatedDate`: `date_approved` (or `date_created` if `date_approved` is empty)
- `body`: Concatenation of `## 1. Objective`, `## 2. Technical Design`, `## 3. Key Changes`, `## 4. Alternatives Considered`, `## 5. Out of Scope` sections.
- `tags`: `project:project_name`, `epic:epic_name`, `type:design-spec` (type label)
- `milestone`: (Not in current template, can be added manually or inferred)
- `touched`: a star is added here every day that we try to work on this

- [x] work_items/data_ingestion_and_export/00_robust-data-ingestion-and-export/01_design-spec.md
- [x] work_items/core_validation/09_interactive-batch-upload/01_design-spec.md
- [x] work_items/developer_experience_improvements/00_integrate-lint-staged/01_design-spec.md
- [x] work_items/developer_experience_improvements/01_introduce-index-ts-for-imports/01_design-spec.md
- [x] work_items/developer_experience_improvements/02_incremental-ci-builds/01_design-spec.md
- [x] work_items/documentation_management/00_manage-genai-docs-content/01_design-spec.md
- [x] work_items/platform_engineering/00_prepare-validation-tool-webapp-for-production/01_design-spec.md
- [x] work_items/platform_engineering/02_pre-commit-hooks/01_design-spec.md
- [x] work_items/platform_engineering/10_containerized-dev-environment/01_design-spec.md
- [x] work_items/platform_engineering/11_containerize-frontend-application/01_design-spec.md

### Architecture Documents

**Backlog.md Fields Mapping (as Document type):**

- `id`: Backlog.md assigned ID (a descriptive ID can be generated from filename, e.g., `arch-data-flow` from `data-flow.md`)
- `title`: Document title
- `type`: `architecture-doc`
- `createdDate`: (To be inferred or set to migration date)
- `updatedDate`: (To be inferred or set to migration date)
- `body`: Entire content of the document
- `tags`: `type:architecture-doc`, `type:documentation`, plus relevant keywords from content
- `touched`: a star is added here every day that we try to work on this

- [ ] docs/architecture/data-flow.md
- [ ] docs/architecture/deployment-model.md
- [ ] docs/architecture/error-handling-and-resilience.md
- [ ] docs/architecture/overview.md
- [ ] docs/architecture/README.md
- [ ] docs/architecture/scalability-and-performance.md
- [ ] docs/architecture/security-considerations.md
- [ ] docs/architecture/SYSTEM_ARCHITECTURE.md
- [ ] docs/architecture/technology-stack.md

### Decisions

**Backlog.md Fields Mapping (as Decision type):**

- `id`: Backlog.md assigned ID (a descriptive ID can be derived from filename, e.g., `decision-0001`)
- `title`: Document title
- `date`: Derived from filename (e.g., `2025-07-09` from `2025-07-09_migration-plan.md`) or `date_created` if present
- `status`: (To be set, e.g., `accepted`, `superseded`)
- `context`: Content from `Context` section
- `decision`: Content from `Decision` section
- `consequences`: Content from `Consequences` section
- `alternatives`: Content from `Alternatives Considered` section
- `touched`: a star is added here every day that we try to work on this

- [ ] docs/decisions/0001-local-file-storage-via-shared-docker-volume.md
- [ ] docs/decisions/0002-local-only-development-premise.md
- [ ] docs/decisions/0003-using-husky-for-git-hooks.md
- [ ] docs/decisions/0004-using-pnpm-as-monorepo-orchestrator.md
- [ ] docs/decisions/2025-07-09_migration-plan.md
- [ ] docs/decisions/data_persistence_and_sharing.md
