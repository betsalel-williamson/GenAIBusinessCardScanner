---
title: 'Create Docker Compose File'
project_name: businessCardGenAI
epic_name: platform_engineering
task_id: 18
story_id: 10
labels: 'docker, docker-compose'
status: 'todo'
date_created: '2025-07-18T14:50:00-07:00'
date_verified_completed: ''
touched: '*'
---

**Description:**

Create a `docker-compose.yml` file in the project root to orchestrate all the services of the application.

**Acceptance Criteria:**

- A `docker-compose.yml` file is created in the project root.
- The file defines the `webapp`, `dagster`, and `redis` services.
- The file defines all necessary volumes for data persistence and inter-service communication.
- The file defines a custom network for inter-service communication.
- Running `docker-compose up` successfully starts all services.
