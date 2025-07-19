---
title: 'Design Spec: Containerized Development Environment'
project_name: businessCardGenAI
epic_name: platform_engineering
story_id: 10
spec_id: 2
status: 'draft'
date_created: '2025-07-18T14:35:00-07:00'
date_approved: ''
---

## 1. Objective

To create a comprehensive, one-command development environment using Docker and Docker Compose to simplify setup, ensure consistency, and improve developer experience.

## 2. Technical Design

The environment will be orchestrated by a single `docker-compose.yml` file at the project root. This file will define and link all the necessary services, volumes, and networks.

### 2.1. Services

* **`webapp`**: This service will run the Node.js application from the `validation_tool.ts` directory. It will require a dedicated `Dockerfile` to be created.
* **`dagster`**: This service will run both the Dagit UI and the Dagster daemon. It will also require a dedicated `Dockerfile`.
* **`redis`**: This service will use the official `redis:alpine` image from Docker Hub.

### 2.2. Dockerfiles

* **`validation_tool.ts/Dockerfile`**: This will be a multi-stage build. The first stage will install dependencies and build the application. The second, smaller stage will copy the built artifacts and run the production server. This will create a smaller, more secure production image.
* **`dagster_business_automations/Dockerfile`**: This will install the Python dependencies and configure the entrypoint to run both the Dagit webserver and the Dagster daemon.

### 2.3. Volumes

To ensure data persistence and communication between services, the following volumes will be defined:

* `db_storage`: For the `business_cards.duckdb` file.
* `cards_to_process`: For the business card files to be processed by Dagster.
* `processing_output`: For the JSON output from the AI extraction.
* `dagster_storage`: For Dagster's run history and other metadata.

### 2.4. Networking

A custom bridge network will be created to allow the services to communicate with each other by name (e.g., the `webapp` service will be able to connect to `redis:6379`).

## 3. Key Changes

* A new `docker-compose.yml` file will be created in the project root.
* A new `Dockerfile` will be created in the `validation_tool.ts` directory.
* A new `Dockerfile` will be created in the `dagster_business_automations` directory.

## 4. Alternatives Considered

* **Individual Dockerfiles:** We could have individual Dockerfiles for each service but no `docker-compose.yml`. This was rejected as it would not provide the one-command setup we are aiming for.
* **Vagrant:** We could use Vagrant to create a virtual machine with all the services. This was rejected as it is a heavier solution than Docker and not as widely used in modern development workflows.

## 5. Out of Scope

* This design does not cover production deployment. The focus is solely on creating a consistent and easy-to-use local development environment.
