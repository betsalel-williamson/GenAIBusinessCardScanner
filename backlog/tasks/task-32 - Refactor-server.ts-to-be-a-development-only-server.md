---
id: task-32
title: Refactor server.ts to be a development-only server
status: verified completed
assignee: []
created_date: '2025-08-06 21:36'
updated_date: '2025-08-06 21:36'
labels:
  - 'project:businessCardGenAI'
  - 'epic:platform_engineering'
  - 'type:task'
  - 'original_id:01_refactor-server-ts-dev-only'
  - backend
  - server
  - development
dependencies: []
---

## Description

Modify the existing server.ts file to remove all production-specific logic. It should only initialize and use the Vite development server.

## Acceptance Criteria

- [ ] server.ts no longer contains isProd checks for server setup
- [ ] server.ts always initializes createViteServer
- [ ] server.ts always uses vite.middlewares
- [ ] server.ts serves index.html and entry-server.tsx directly from the source for development
- [ ] server.ts removes compression and express.static for dist/client.
