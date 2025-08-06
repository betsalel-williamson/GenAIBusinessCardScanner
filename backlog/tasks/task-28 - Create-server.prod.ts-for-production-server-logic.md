---
id: task-28
title: Create server.prod.ts for production server logic
status: verified completed
assignee: []
created_date: '2025-08-06 21:35'
updated_date: '2025-08-06 21:35'
labels:
  - 'project:businessCardGenAI'
  - 'epic:platform_engineering'
  - 'type:task'
  - 'original_id:00_create-server-prod-ts'
  - backend
  - server
  - production
dependencies: []
---

## Description

Create a new file server.prod.ts in the validation_tool.ts directory. This file will contain the server-side rendering (SSR) logic and static file serving for the production environment. It will not include any Vite development server dependencies.

## Acceptance Criteria

- [ ] A new file validation_tool.ts/server.prod.ts exists
- [ ] server.prod.ts imports necessary modules for a production Express server (e.g.
- [ ] express
- [ ] compression
- [ ] cors
- [ ] path
- [ ] fs)
- [ ] server.prod.ts serves static assets from dist/client
- [ ] server.prod.ts handles SSR by importing entry-server.js from dist/server
- [ ] server.prod.ts listens on a configurable port (e.g.
- [ ] process.env.PORT or a default).
