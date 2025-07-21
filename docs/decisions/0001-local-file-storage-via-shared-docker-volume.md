---
title: "Local File Storage via Shared Docker Volume"
date: 2025-07-19
status: accepted
---

## Context

The project requires a mechanism for persistent file storage, specifically for uploaded business card images, that can be accessed by multiple Docker containers (e.g., the `validation_tool.ts` Express.js backend for uploads and the `dagster_business_automations` for processing). The initial thought was to use MinIO to provide an S3-compatible API locally.

## Decision

For the current local-only development scope, we will use a **shared Docker volume** for file persistence. This volume will be mounted into both the `validation_tool.ts` container (where files are uploaded) and the `dagster_business_automations` container (where files are processed).

## Alternatives Considered

* **MinIO**:
  * **Pros**: Provides an S3-compatible API, which is excellent for mimicking a cloud environment and future-proofing for cloud S3 migration.
  * **Cons**: Introduces an additional service (MinIO container) and requires S3 client library integration and configuration in both the Node.js and Python applications, adding complexity that is not strictly necessary for the current local-only scope.

## Consequences

* **Positive**:
  * **Simplicity**: Significantly reduces setup complexity for local development. No need for S3 client libraries or S3-specific configuration in application code for file storage.
  * **Direct Filesystem Access**: Services interact with files directly via the mounted volume, which is straightforward and efficient for local operations.
  * **Reduced Overhead**: Fewer containers and less application-level configuration for file storage.
* **Negative**:
  * **No S3 API**: Does not provide an S3-compatible API locally. If future plans involve migrating to cloud S3, application code will need to be updated to use S3 client libraries.
  * **Less Production-like**: This approach is less representative of a production environment where object storage would typically be a separate, managed service with an API.
* **Neutral**:
  * **Data Persistence**: Data will still be persistent across container restarts as long as the Docker volume is not explicitly removed.

This decision prioritizes ease of local development and setup, acknowledging that a transition to a more production-like object storage solution will require code changes in the future.
