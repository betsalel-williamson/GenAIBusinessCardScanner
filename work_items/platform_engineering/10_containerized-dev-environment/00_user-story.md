---
title: 'Containerized Development Environment'
project_name: businessCardGenAI
epic_name: platform_engineering
story_id: 10
labels: 'docker, developer-experience'
status: 'todo'
date_created: '2025-07-18T14:30:00-07:00'
date_verified_completed: ''
touched: '*'
---

- **As a** Developer,
- **I want to** have a fully containerized development environment managed by Docker Compose,
- **so that** I can spin up the entire application stack (webapp, dagster, redis, dbt) with a single command, ensuring consistency and simplifying setup.

## Acceptance Criteria

- A single `docker-compose.yml` file in the project root orchestrates all services.
- The `webapp` service (Node.js/React) is containerized and serves the frontend and backend.
- The `dagster` service (Dagit UI and daemon) is containerized.
- A `redis` service is included for message brokering.
- All necessary volumes for data persistence and inter-service communication are defined (e.g., for DuckDB, files to process, etc.).
- The entire stack can be launched with a single `docker-compose up` command.
- The local development environment remains functional and is not broken by these changes.

## Metrics for Success

- **Primary Metric**: Time for a new developer to get the application running locally is reduced from hours to under 10 minutes.
- **Secondary Metrics**: The number of "it works on my machine" issues is reduced to zero.
