---
title: 'Refactor `server.ts` to be a development-only server'
project_name: 'businessCardGenAI'
epic_name: 'platform_engineering'
task_id: '01_refactor-server-ts-dev-only'
labels: 'backend, server, development'
status: 'todo'
date_created: '2025-07-18T12:00:00-07:00'
date_verified_completed: ''
touched: '*'
---

## Task

Modify the existing `server.ts` file to remove all production-specific logic. It should only initialize and use the Vite development server.

## Acceptance Criteria

- [ ] `server.ts` no longer contains `isProd` checks for server setup.
- [ ] `server.ts` always initializes `createViteServer`.
- [ ] `server.ts` always uses `vite.middlewares`.
- [ ] `server.ts` serves `index.html` and `entry-server.tsx` directly from the source for development.
- [ ] `server.ts` removes `compression` and `express.static` for `dist/client`.

## Context/Links

- Related design spec: `work_items/platform_engineering/00_prepare-validation-tool-webapp-for-production/01_design-spec.md`
