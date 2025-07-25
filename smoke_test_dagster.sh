#!/bin/bash

set -euo pipefail

APP_URL="http://localhost:3000"
# Accept container name as first argument. If not provided, the script will exit.
# This makes it explicit that the container name must be passed.
CONTAINER_NAME="$1"

if [ -z "$CONTAINER_NAME" ]; then
  echo "Usage: $0 <container_name>"
  echo "Error: Container name not provided. Please pass the Dagster container name as an argument."
  exit 1
fi

echo "Running smoke tests for Dagster UI (Container: ${CONTAINER_NAME})..."

# Check if the container is running
if ! docker ps --filter "name=${CONTAINER_NAME}" --format "{{.Names}}" | grep -q "${CONTAINER_NAME}"; then
  echo "Error: Dagster container '${CONTAINER_NAME}' is not running. Please start it first."
  exit 1
fi

# Test 1: Check root HTML page (Dagit UI)
echo "--- Testing Dagit UI root page (${APP_URL}/) ---"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" ${APP_URL}/)

if [ "$RESPONSE" -eq 200 ]; then
  echo "Dagit UI root page: PASS (HTTP 200 OK)"
else
  echo "Dagit UI root page: FAIL (HTTP ${RESPONSE})"
  exit 1
fi

# Test 2: Check /graphql endpoint (common Dagster API endpoint)
echo "--- Testing Dagit UI GraphQL endpoint (${APP_URL}/graphql) ---"
GRAPHQL_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" ${APP_URL}/graphql -H "Content-Type: application/json" -d '{"query":"{ __schema { queryType { name } } }"}' )

if [ "$GRAPHQL_RESPONSE" -eq 200 ]; then
  echo "Dagit UI GraphQL endpoint: PASS (HTTP 200 OK)"
else
  echo "Dagit UI GraphQL endpoint: FAIL (HTTP ${GRAPHQL_RESPONSE})"
  exit 1
fi

echo "All smoke tests passed successfully!"
exit 0
