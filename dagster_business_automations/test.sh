#!/usr/bin/env sh

set -e

cd $(dirname "$0")

# Run lintering and formatting checks
echo "Running lintering and formatting checks..."
black .
flake8 .

# Run tests
echo "Running tests..."
# Ensure the environment variables are set for testing
if [ ! -f ".env.test" ]; then
  echo ".env.test file not found. Please create it with the necessary environment variables for testing."
  exit 1
fi
# Load environment variables from .env.test
# This assumes you have a .env.test file with the necessary variables for testing
# If you are using a different method to set environment variables, adjust accordingly
set -a
source .env.test
set +a

pytest \
  --cov=dagster_card_processor \
  --cov-report=xml:coverage.xml \
  --junitxml=pytest-report.xml
