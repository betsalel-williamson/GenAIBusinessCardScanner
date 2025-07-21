# syntax=docker/dockerfile:1

FROM python:3.12-slim

# Set environment variables for security
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Set the PATH to include standard system binaries and the virtual environment's bin directory
ENV PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/app/dagster_business_automations/.venv/bin"

# Install system dependencies and clean up (minimal)
RUN apt-get update && rm -rf /var/lib/apt/lists/*

# Install uv package manager
RUN pip install --no-cache-dir uv

# Create a non-root user and group, and ensure home directory exists and is owned by appuser
RUN groupadd -r appuser && useradd --no-log-init -r -g appuser -m appuser \
    && mkdir -p /home/appuser \
    && chown -R appuser:appuser /home/appuser

# Set workdir to /app
WORKDIR /app

# Copy essential files and directories
COPY dagster_business_automations/dagster_card_processor/ ./dagster_business_automations/dagster_card_processor/
COPY dagster_business_automations/pyproject.toml ./dagster_business_automations/pyproject.toml
COPY dagster_business_automations/dagster.yaml ./dagster_business_automations/dagster.yaml
COPY dagster_business_automations/workspace.yaml ./dagster_business_automations/workspace.yaml
COPY dagster_business_automations/config/ ./dagster_business_automations/config/
COPY dagster_business_automations/healthcheck.py ./dagster_business_automations/healthcheck.py
COPY dbt_project/ ./dbt_project/

# Now change WORKDIR to the dagster project root for dependency installation and running
WORKDIR /app/dagster_business_automations

# Install Python dependencies using uv with --system (container best practice)
RUN uv pip install --system . requests

# Install 'dg' CLI (assumes it's available via pip)
# RUN uv pip install --system dagster-dagster-dev

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose default Dagster port
EXPOSE 3000

# Healthcheck for Dagster UI
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD python healthcheck.py

# Entrypoint
CMD ["dg", "dev", "-m", "dagster_card_processor", "--host", "0.0.0.0"]