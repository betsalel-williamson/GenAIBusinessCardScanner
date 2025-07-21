# Architecture Overview

This document provides a high-level overview of the system's architecture, including its main components and their interactions, with a focus on local deployment.

## 1. System Goals

- **Efficient Business Card Processing**: Automate the extraction and digitization of information from business cards.
- **Ease of Setup and Use**: Provide a straightforward setup process for local development and testing.
- **Local Performance**: Ensure responsive performance within a local development environment.
- **Extensibility**: Allow for easy integration of new features and local services.
- **Data Integrity**: Maintain the integrity of processed data within the local environment.

## 2. High-Level Components

The system is composed of several loosely coupled services, designed to run as Docker containers via Docker Compose for local development.

- **Frontend Service (`validation_tool.ts`)**: A React web application providing the user interface for uploading, viewing, and managing business cards.
- **API/Validation Backend (`validation_tool.ts`)**: An Express.js application handling file uploads, initial validation, and serving the frontend. It uses SQLite for local data storage.
- **Data Processing & Automation Backend (`dagster_business_automations`)**: A Dagster project responsible for orchestrating more complex business card processing, data transformation (using dbt-duckdb), and potentially external integrations (e.g., Google Generative AI, Postmark for emails).
- **Redis**: Used for caching or as a message broker, potentially by Dagster.
- **Database Services**: SQLite (for `validation_tool.ts`) and DuckDB (for `dagster_business_automations`).
- **File Storage**: A shared Docker volume for persistent storage of uploaded images, accessible by both `validation_tool.ts` and `dagster_business_automations`.

## 3. Key Interactions

1. **User Interaction**: Users interact with the **Frontend Service** to upload business card images.
2. **File Upload**: The **Frontend Service** sends uploaded images to the **API/Validation Backend**.
3. **Initial Processing**: The **API/Validation Backend** stores the image on the shared Docker volume and performs initial validation.
4. **Data Orchestration**: The **API/Validation Backend** or a separate trigger initiates a Dagster job in the **Data Processing & Automation Backend** for further processing.
5. **Deep Processing**: The **Data Processing & Automation Backend** retrieves images from the shared Docker volume, performs OCR, extracts and normalizes data, and stores results in DuckDB.
6. **Notifications/Integrations**: The **Data Processing & Automation Backend** handles notifications (e.g., via Postmark) and integrates with other services (e.g., Google Generative AI).
7. **Data Retrieval**: The **Frontend Service** retrieves processed business card data from the **API/Validation Backend**, which might query both SQLite and DuckDB (via Dagster or direct access).

## 4. Current State

- The core frontend and API/validation backend are implemented within `validation_tool.ts`.
- A Dagster project (`dagster_business_automations`) exists for data processing and automation.
- `docker-compose.yml` currently only defines a Redis service, indicating an incomplete local development setup.
- File uploads are handled by `multer` and stored on the local filesystem within the `validation_tool.ts` service.

## 5. Immediate Goals

- Complete the `docker-compose.yml` to include all core services (frontend, API/validation backend, Dagster, databases, and Redis) and configure the shared Docker volume for file storage.
- Ensure seamless local development experience with all services running via Docker Compose.
- Integrate the `validation_tool.ts` backend with the `dagster_business_automations` for triggering and monitoring processing jobs.

## 6. Future Considerations

- **External Hosting**: Transition to a cloud-agnostic container orchestration platform (e.g., Kubernetes) for production deployment.
- **Cloud Object Storage**: Implement a robust object storage solution (e.g., AWS S3, Google Cloud Storage) for production, which would require updating application code to use S3 client libraries.
- **Scalability & Resilience**: Implement advanced patterns for horizontal scaling, load balancing, and fault tolerance.
- **Comprehensive Monitoring**: Integrate with Prometheus/Grafana and ELK stack for production monitoring and logging.
- **User Management**: Implement a dedicated user management service for robust authentication and authorization.

## System Architecture Diagram

```mermaid
graph TD
    A[User] --> B(Frontend Service: validation_tool.ts)
    B --> C(API/Validation Backend: validation_tool.ts)
    C --> D[Shared Docker Volume (File Storage)]
    C --> E[SQLite Database]
    C --> F(Data Processing & Automation Backend: dagster_business_automations)
    F --> G[DuckDB]
    F --> H[Redis]
    F --> I(External Services: Google Generative AI, Postmark)
    E --> C
    G --> F
    H --> F
    D --> C
    D --> F
```
