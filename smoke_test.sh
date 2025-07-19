#!/bin/bash

APP_URL="http://localhost:7456"

echo "Running smoke tests for validation-webapp..."

# Test 1: Check root HTML page
echo "\n--- Testing root HTML page (${APP_URL}/) ---"
RESPONSE=$(curl -s -o /dev/null -w "%{\nhttp_code}" ${APP_URL}/)

if [ "$RESPONSE" -eq 200 ]; then
  echo "Root HTML page: PASS (HTTP 200 OK)"
else
  echo "Root HTML page: FAIL (HTTP ${RESPONSE})"
  exit 1
fi

# Test 2: Check /api/files endpoint
echo "\n--- Testing /api/files endpoint (${APP_URL}/api/files) ---"
API_RESPONSE=$(curl -s ${APP_URL}/api/files)
API_STATUS=$(curl -s -o /dev/null -w "%{\nhttp_code}" ${APP_URL}/api/files)

if [ "$API_STATUS" -eq 200 ] && [ "$API_RESPONSE" = "[]" ]; then
  echo "/api/files endpoint: PASS (HTTP 200 OK, returns empty array)"
elif [ "$API_STATUS" -eq 200 ]; then
  echo "/api/files endpoint: PASS (HTTP 200 OK, content: ${API_RESPONSE})"
else
  echo "/api/files endpoint: FAIL (HTTP ${API_STATUS}, content: ${API_RESPONSE})"
  exit 1
fi

echo "\nAll smoke tests passed successfully!"
exit 0
