---
title: 'Create `server.prod.ts` for production server logic'
project_name: 'businessCardGenAI'
epic_name: 'platform_engineering'
task_id: '00_create-server-prod-ts'
labels: 'backend, server, production'
status: 'todo'
date_created: '2025-07-18T12:00:00-07:00'
date_verified_completed: ''
touched: '*'
---

## Task

Create a new file `server.prod.ts` in the `validation_tool.ts` directory. This file will contain the server-side rendering (SSR) logic and static file serving for the production environment. It will not include any Vite development server dependencies.

## Acceptance Criteria

- [ ] A new file `validation_tool.ts/server.prod.ts` exists.
- [ ] `server.prod.ts` imports necessary modules for a production Express server (e.g., `express`, `compression`, `cors`, `path`, `fs`).
- [ ] `server.prod.ts` serves static assets from `dist/client`.
- [ ] `server.prod.ts` handles SSR by importing `entry-server.js` from `dist/server`.
- [ ] `server.prod.ts` listens on a configurable port (e.g., `process.env.PORT` or a default).

## Context/Links

- Related design spec: `work_items/platform_engineering/00_prepare-validation-tool-webapp-for-production/01_design-spec.md`
