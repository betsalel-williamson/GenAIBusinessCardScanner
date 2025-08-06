---
id: task-33
title: Update package.json scripts for production build and serve
status: verified completed
assignee: []
created_date: '2025-08-06 21:36'
updated_date: '2025-08-06 21:37'
labels:
  - 'project:businessCardGenAI'
  - 'epic:platform_engineering'
  - 'type:task'
  - 'original_id:02_update-package-json-scripts'
  - build
  - package.json
dependencies: []
---

## Description

Modify the package.json file to update the build:server and serve scripts to correctly build and serve the production-ready server.

## Acceptance Criteria

- [ ] The build:server script in package.json is updated to output server.prod.js (or similar) from server.prod.ts
- [ ] The serve script in package.json is updated to run the compiled production server file (e.g.
- [ ] node dist/server/server.prod.js).
