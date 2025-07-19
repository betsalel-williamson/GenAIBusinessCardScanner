---
title: 'Automate Code Quality Checks with Pre-Commit Hooks'
project_name: businessCardGenAI
epic_name: platform_engineering
story_id: 02_pre-commit-hooks
labels: platform, developer-experience, automation
status: todo
date_created: 2025-07-18T21:12:00-07:00
date_verified_completed:
touched: *
---

- **As a** developer,
- **I want to** have automatic code quality checks (linting, formatting, type-checking) run before every commit,
- **so that** I can catch and fix issues early, ensuring consistent code quality and reducing CI/CD failures.

## Acceptance Criteria

- Husky and `lint-staged` are installed and configured at the repository root.
- Hooks are defined for all relevant code types (Python, TypeScript/JavaScript, Markdown).
- Hooks run automatically on `git commit`.
- Auto-fixable issues are automatically staged and committed.
- Hooks prevent commits if non-fixable checks fail.
- Instructions for setting up Git hooks are clearly documented in the `README.md`.

## Metrics for Success

- **Primary Metric**: 0% increase in CI/CD failures related to linting/formatting/type-checking after implementation.
- **Secondary Metrics**:
  - Reduction in manual code review comments related to style/formatting.
  - Positive developer feedback on the automation of code quality checks.
