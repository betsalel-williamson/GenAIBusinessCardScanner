---
title: 'Refactor Validation Tool Server for Production Readiness'
project_name: 'businessCardGenAI'
epic_name: 'platform_engineering'
story_id: '00_prepare-validation-tool-webapp-for-production'
spec_id: '01_refactor-validation-tool-server'
status: 'draft'
date_created: '2025-07-18T12:00:00-07:00'
date_approved: ''
touched: '*'
---

## 1. Objective

To separate development and production server configurations for the Validation Tool web application to ensure a clean, optimized, and secure production deployment.

## 2. Technical Design

The current `server.ts` file mixes development and production concerns, primarily through conditional logic based on `process.env.NODE_ENV`. This design proposes to separate these concerns into distinct server entry points:

* `server.ts`: Will be dedicated to the development server, leveraging Vite's development middleware for hot module reloading and unoptimized asset serving.
* `server.prod.ts`: Will be a new file containing the production-only server logic. This server will serve pre-built static assets and the server-side rendered (SSR) bundle from the `dist` directory, without any Vite development server dependencies.

## 3. Key Changes

### 3.1. API Contracts

No changes to existing API contracts.

### 3.2. Data Models

No changes to existing data models.

### 3.3. Component Responsibilities

* `server.ts`: Responsible for serving the development environment, including Vite's development server.
* `server.prod.ts` (new): Responsible for serving the production build, including static assets and the SSR bundle.
* `package.json`: The `serve` script will be updated to point to `dist/server/server.prod.js` (or similar, depending on the build output).

## 4. Alternatives Considered

* **Keeping `isProd` conditionals in `server.ts`:** This was initially considered but rejected due to the desire for clearer separation of concerns, reduced production bundle size, and improved maintainability. Mixing development and production logic in a single file can lead to increased complexity and potential for errors in a production environment.

## 5. Out of Scope

* Changes to the client-side build process (Vite configuration for client assets).
* Database schema changes.
* API endpoint modifications.
