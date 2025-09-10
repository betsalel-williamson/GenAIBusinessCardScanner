---
title: 'Set Up Redis with Docker Compose'
project_name: businessCardGenAI
epic_name: interactive_batch_upload
task_id: 15
story_id: 9
labels: 'backend, redis, docker'
status: 'todo'
date_created: '2025-07-18T14:00:00-07:00'
date_verified_completed: ''
touched: '*'
---

**Description:**

Add a `docker-compose.yml` file to the root of the project to manage a Redis instance. This will serve as the message broker between the Dagster pipeline and the web application's backend.

**Acceptance Criteria:**

- A `docker-compose.yml` file is created in the project root.
- The file defines a service for Redis, using the official Redis image.
- The Redis instance is configured to be accessible to both the Dagster and web application services.
- Running `docker-compose up` successfully starts the Redis container.
