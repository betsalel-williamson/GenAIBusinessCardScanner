---
id: doc-4
title: 'Integrate Lint-Staged'
type: design-spec
created_date: '2025-07-21T12:00:00-07:00'
updated_date: ''
tags:
  - 'project:businessCardGenAI'
  - 'epic:developer_experience_improvements'
  - 'type:design-spec'
  - 'original_id:01_integrate-lint-staged-design-spec'
touched: '*'
---

## 1. Objective

This design aims to integrate `lint-staged` into the project to automatically run linters and formatters on staged Git files, ensuring code quality before commits.

## 2. Technical Design

`lint-staged` will be configured in `package.json` to run specific commands (e.g., `eslint --fix`, `prettier --write`, `tsc --noEmit`) on files staged for commit. This will be integrated with Husky pre-commit hooks.

## 3. Key Changes

### 3.1. API Contracts

No API contract changes.

### 3.2. Data Models

No data model changes.

### 3.3. Component Responsibilities

- **`package.json`**: Will include `lint-staged` configuration.
- **`.husky/pre-commit`**: Will execute `lint-staged`.

## 4. Alternatives Considered

- **Manual linting/formatting**: Rejected due to inconsistency and reliance on developer discipline.
- **CI/CD linting**: Rejected as primary enforcement, as it provides feedback too late in the development cycle.

## 5. Out of Scope

- Configuration of specific linting rules or formatting styles (these are assumed to be pre-existing).
- Integration with other Git hooks beyond `pre-commit`.
