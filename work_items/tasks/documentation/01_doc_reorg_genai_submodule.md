---
title: 'Reorganize Documentation and Prepare genai-docs for Submodule'
project_name: 'businessCardGenAI'
epic_name: 'documentation_management'
task_id: '01_doc_reorg_genai_submodule'
labels: 'documentation, architecture, genai'
status: 'todo'
date_created: '2025-07-19T12:00:00-07:00'
date_verified_completed: ''
touched: '*'
---

## Task

Document the plan for reorganizing project documentation, specifically separating AI-specific guidelines (`genai-docs`) from developer-facing documentation (`docs`), and preparing `genai-docs` to become a Git submodule for reusability across projects.

## Acceptance Criteria

- [ ] A clear distinction is made between `genai-docs` (AI-specific, static, project-agnostic) and `docs` (developer-facing, living, project-specific).
- [ ] The `genai-docs` directory contains only AI-specific instructions and guidelines.
- [ ] The `docs` directory contains all developer-facing documentation, including architecture, ADRs, and general coding guidelines.
- [ ] The `genai-docs/guidelines` folder is confirmed to contain only AI-specific language guidelines (e.g., `pkl`, `react`, `rust`, `typescript` guidelines).
- [ ] The `docs/guidelines` folder is confirmed to contain general coding guidelines (e.g., `docker.md`).
- [ ] All internal links within `genai-docs` and `docs` are updated to reflect the new file paths.
- [ ] The `genai-docs/README.md` is updated to reflect its purpose as an index for AI-specific documentation only.
- [ ] The `docs/README.md` is updated to serve as an index for developer-facing documentation.
- [ ] A plan is outlined for migrating `genai-docs` to its own Git repository and integrating it as a submodule.
- [ ] A plan is outlined for creating a central repository for general coding guidelines and selectively pulling them into projects.

## Context/Links

- Previous discussions regarding documentation organization.
- ADRs related to local-only development and shared Docker volumes.

## Current State of Documentation (as of 2025-07-19)

### `genai-docs/`

- **Intended**: AI-specific, static, project-agnostic. To become a Git submodule.
- **Current Content**: Still contains `design-spec-standards.md`, `task-standards.md`, `user-story-standards.md` which should be in `docs/standards/`. Contains `guidelines/` which should contain only AI-specific language guidelines.

### `docs/`

- **Intended**: Developer-facing, living, project-specific.
- **Current Content**: Contains `architecture/`, `decisions/`, and `standards/` (which should receive the standards files from `genai-docs/`). Contains `guidelines/` which should receive general coding guidelines.

### `genai-docs/guidelines/`

- **Intended**: AI-specific language guidelines (e.g., `pkl`, `react`, `rust`, `typescript` guidelines).
- **Current Content**: Contains `docker.md` (which should be in `docs/guidelines/`). Contains `python/` (which is empty and should be removed). Contains `pkl`, `react`, `rust`, `typescript` directories (which should remain here).

## Proposed Plan for Reorganization and Git Submodule Migration

1. **Finalize File Movements within Current Project:**
    - Move `design-spec-standards.md`, `task-standards.md`, `user-story-standards.md` from `genai-docs/` to `docs/standards/`.
    - Move `genai-docs/guidelines/docker.md` to `docs/guidelines/docker.md`.
    - Remove empty `genai-docs/guidelines/python/` directory.
    - Ensure `genai-docs/guidelines/` only contains AI-specific language guidelines (e.g., `pkl`, `react`, `rust`, `typescript` directories).

2. **Update Internal Links:**
    - Thoroughly review and update all relative links within `genai-docs/` and `docs/` to reflect the new file paths.

3. **Update READMEs:**
    - Revise `genai-docs/README.md` to clearly state its purpose as an index for AI-specific documentation only, and update its table of contents accordingly.
    - Revise `docs/README.md` to serve as the primary index for developer-facing documentation, including architecture, ADRs, and standards.

4. **Prepare `genai-docs` for Git Submodule (Future Action):**
    - Create a new, separate Git repository for `genai-docs`.
    - Move the finalized `genai-docs` content into this new repository.
    - In the main project, remove the `genai-docs` directory and add the new `genai-docs` repository as a Git submodule.

5. **Centralize General Coding Guidelines (Future Action):**
    - Create a new, separate Git repository for general coding guidelines (e.g., `coding-guidelines-library`).
    - Move the content of `docs/guidelines/` (e.g., `docker.md`) into this new repository.
    - Projects can then selectively pull in relevant guidelines from this repository (e.g., via Git submodule or direct copy, depending on preference).

This task outlines the necessary steps to achieve a clean, maintainable, and reusable documentation structure.
