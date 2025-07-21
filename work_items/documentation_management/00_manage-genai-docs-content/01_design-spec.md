---
title: 'Design for genai-docs content management CLI'
project_name: 'businessCardGenAI'
epic_name: 'documentation_management'
story_id: '00_manage-genai-docs-content'
spec_id: '01_design-spec'
status: 'draft'
date_created: '2025-07-20T00:00:00-07:00'
date_approved: ''
touched: '*'
---

## 1. Objective

To design a cross-platform CLI tool (initially as an npm package, with future consideration for a pip package) that enables seamless integration, updating, and contribution to shared `genai-docs` content within a project, eliminating the need for Git submodules.

## 2. Technical Design

The proposed solution is a standalone CLI tool, implemented in TypeScript (for npm package) or Python (for pip package), that interacts directly with Git repositories. It will manage the `genai-docs` directory within a consuming project's repository, ensuring the content is tracked locally while allowing synchronization with a central `genai-docs` source.

### Core Components

- **CLI Interface**: Exposed commands (`init`, `sync`) for user interaction.
- **Git Client**: Utilizes a programmatic Git library (e.g., `isomorphic-git` for Node.js, `GitPython` for Python) to perform repository operations.
- **File System Manager**: Handles copying, moving, and comparing files/directories.
- **Configuration Manager**: Manages the central `genai-docs` repository URL and Personal Access Token (PAT).

### Workflow

1. **`init` Command**: When executed in a project, it will clone the central `genai-docs` repository into the project's designated `genai-docs/` directory. It will then add and commit these files to the *local* project's Git repository.
2. **`sync` Command**: This command will fetch the latest changes from the central `genai-docs` repository. It will then apply these changes to the local `genai-docs/` directory, overwriting existing files and adding new ones. Finally, it will commit these updates to the *local* project's Git repository. Future enhancements could include pushing local modifications back to the central repository.

## 3. Key Changes

### 3.1. API Contracts

- **CLI Commands**:
  - `genai-docs-manager init [--remote-url <url>] [--target-dir <path>] [--pat <token>]`
    - `remote-url`: URL of the central `genai-docs` repository (default: configurable).
    - `target-dir`: Local directory to place `genai-docs` (default: `genai-docs/`).
    - `pat`: Personal Access Token for Git operations (read/write access to central repo). Can be provided via environment variable (`GENAI_DOCS_PAT`).
  - `genai-docs-manager sync [--remote-url <url>] [--target-dir <path>] [--pat <token>]`
    - Same parameters as `init`.

### 3.2. Data Models

- No new persistent data models. The tool operates on existing Git repositories and file systems.

### 3.3. Component Responsibilities

- **CLI Tool**: Orchestrates Git and file system operations based on user commands.
- **Consuming Project**: Hosts the `genai-docs/` directory as a tracked part of its repository.
- **Central `genai-docs` Repository**: The single source of truth for `genai-docs` content.

## 4. Alternatives Considered

- **Git Submodules**: Rejected due to complexity, difficulty in managing updates, and issues with local modifications and pushing back to the central repository.
- **Manual Copying**: Rejected due to high manual effort, error-proneness, and lack of version control/synchronization.

## 5. Out of Scope

- Automatic detection of `genai-docs` changes in the local project for pushing back to the central repository (will be a future enhancement).
- Complex merge conflict resolution within the `genai-docs` directory (basic overwriting on sync).
- Management of other shared assets beyond `genai-docs` (though the architecture could be extended).
