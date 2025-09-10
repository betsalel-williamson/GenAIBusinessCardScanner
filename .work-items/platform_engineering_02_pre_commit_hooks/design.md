---
title: 'Design Spec for Pre-Commit Hook Implementation'
project_name: businessCardGenAI
epic_name: platform_engineering
story_id: 02_pre-commit-hooks
spec_id: 01_pre-commit-design
status: draft
date_created: 2025-07-18T21:12:00-07:00
date_approved:
touched: *
---

## 1. Objective

To implement and configure the `pre-commit` framework in the monorepo to automate code quality checks before every Git commit, ensuring consistent code style and early detection of issues.

## 2. Technical Design

The `pre-commit` framework will be installed as a development dependency. A `.pre-commit-config.yaml` file will be created at the repository root to define the hooks. This configuration will include hooks for:

- **Python**: Using `uv` to manage dependencies, `ruff` for linting and formatting, and `mypy` for type checking.
- **TypeScript/JavaScript**: Using `pnpm` to manage dependencies, `eslint` for linting, and `prettier` for formatting.
- **Markdown**: Using `markdownlint-cli2` for linting.

The `pre-commit` framework will manage the installation and execution of these tools in isolated environments, ensuring no conflicts between different language toolchains.

## 3. Key Changes

### 3.1. Repository Structure

- Add `.pre-commit-config.yaml` to the repository root.

### 3.2. Dependencies

- Add `pre-commit` to `requirements-dev.txt` (or equivalent for `uv`).
- Ensure `ruff`, `mypy`, `eslint`, `prettier`, and `markdownlint-cli2` are available via their respective package managers (e.g., `uv` for Python, `pnpm` for Node.js).

### 3.3. Git Hooks

- `pre-commit install` will be the command developers run to set up the hooks.
- Hooks will run on `git commit`.

## 4. Alternatives Considered

- **Husky/lint-staged**: Considered for JavaScript/TypeScript projects. Rejected because `pre-commit` offers a more unified, language-agnostic solution for a mixed-tech monorepo, simplifying configuration and management across different languages.
- **Custom Shell Scripts**: Considered for individual Git hooks. Rejected due to complexity in managing dependencies, ensuring cross-platform compatibility, and providing clear feedback compared to the `pre-commit` framework.

## 5. Out of Scope

- Automatic installation of `pre-commit` framework itself (e.g., via a global setup script). This will be covered by clear `README.md` instructions and CI/CD enforcement.
- Detailed configuration of each linter/formatter (e.g., specific `ruff` rules, `eslint` plugins). These configurations will reside in their respective tool configuration files (e.g., `pyproject.toml`, `.eslintrc.cjs`).
