---
title: 'Update `package.json` scripts for production build and serve'
project_name: 'businessCardGenAI'
epic_name: 'platform_engineering'
task_id: '02_update-package-json-scripts'
labels: 'build, package.json'
status: 'todo'
date_created: '2025-07-18T12:00:00-07:00'
date_verified_completed: ''
touched: '*'
---

## Task

Modify the `package.json` file to update the `build:server` and `serve` scripts to correctly build and serve the production-ready server.

## Acceptance Criteria

- [ ] The `build:server` script in `package.json` is updated to output `server.prod.js` (or similar) from `server.prod.ts`.
- [ ] The `serve` script in `package.json` is updated to run the compiled production server file (e.g., `node dist/server/server.prod.js`).

## Context/Links

- Related design spec: `work_items/platform_engineering/00_prepare-validation-tool-webapp-for-production/01_design-spec.md`
