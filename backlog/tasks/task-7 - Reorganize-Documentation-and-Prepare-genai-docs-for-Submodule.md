---
id: task-7
title: Reorganize Documentation and Prepare genai-docs for Submodule
status: todo
assignee: []
created_date: '2025-08-06 21:30'
updated_date: '2025-08-06 21:30'
labels:
  - 'project:businessCardGenAI'
  - 'epic:documentation_management'
  - 'type:task'
  - 'original_id:01_doc_reorg_genai_submodule'
  - documentation
  - architecture
  - genai
dependencies: []
---

## Description

Document the plan for reorganizing project documentation, specifically separating AI-specific guidelines (genai-docs) from developer-facing documentation (docs), and preparing genai-docs to become a Git submodule for reusability across projects.

## Acceptance Criteria

- [ ] A clear distinction is made between genai-docs (AI-specific
- [ ] static
- [ ] project-agnostic) and docs (developer-facing
- [ ] living
- [ ] project-specific)
- [ ] The genai-docs directory contains only AI-specific instructions and guidelines
- [ ] The docs directory contains all developer-facing documentation
- [ ] including architecture
- [ ] ADRs
- [ ] and general coding guidelines
- [ ] The genai-docs/guidelines folder is confirmed to contain only AI-specific language guidelines (e.g.
- [ ] pkl
- [ ] react
- [ ] rust
- [ ] typescript guidelines)
- [ ] The docs/guidelines folder is confirmed to contain general coding guidelines (e.g.
- [ ] docker.md)
- [ ] All internal links within genai-docs and docs are updated to reflect the new file paths
- [ ] The genai-docs/README.md is updated to reflect its purpose as an index for AI-specific documentation only
- [ ] The docs/README.md is updated to serve as an index for developer-facing documentation
- [ ] A plan is outlined for migrating genai-docs to its own Git repository and integrating it as a submodule
- [ ] A plan is outlined for creating a central repository for general coding guidelines and selectively pulling them into projects.
