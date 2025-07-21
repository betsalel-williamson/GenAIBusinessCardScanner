#!/bin/bash

set -euo pipefail

APP_URL="http://localhost:3000"
CONTAINER_NAME="dagster_smoke_test_container"

echo "Running smoke tests for Dagster UI..."

# Check if the container is running
if ! docker ps --filter "name=${CONTAINER_NAME}" --format "{{.Names}}" | grep -q "${CONTAINER_NAME}"; then
  echo "Error: Dagster container '${CONTAINER_NAME}' is not running. Please start it first using scripts/start_dagster_container.sh."
  exit 1
fi

# Test 1: Check root HTML page (Dagit UI)
echo "\n--- Testing Dagit UI root page (${APP_URL}/) ---"
RESPONSE=$(curl -s -o /dev/null -w "%{\nhttp_code}" ${APP_URL}/)

if [ "$RESPONSE" -eq 200 ]; then
  echo "Dagit UI root page: PASS (HTTP 200 OK)"
else
  echo "Dagit UI root page: FAIL (HTTP ${RESPONSE})"
  exit 1
fi

# Test 2: Check /graphql endpoint (common Dagster API endpoint)
echo "\n--- Testing Dagit UI GraphQL endpoint (${APP_URL}/graphql) ---"
GRAPHQL_RESPONSE=$(curl -s -o /dev/null -w "%{\nhttp_code}" ${APP_URL}/graphql -H "Content-Type: application/json" -d '{"query":"{ __schema { queryType { name } } }"}')

if [ "$GRAPHQL_RESPONSE" -eq 200 ]; then
  echo "Dagit UI GraphQL endpoint: PASS (HTTP 200 OK)"
else
  echo "Dagit UI GraphQL endpoint: FAIL (HTTP ${GRAPHQL_RESPONSE})"
  exit 1
fi

echo "\nAll smoke tests passed successfully!"
exit 0