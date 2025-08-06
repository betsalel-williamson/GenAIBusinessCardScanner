#!/usr/bin/env sh

set -e

cd "$(dirname "$0")"

source ./.venv/bin/activate

# Run lintering and formatting checks
echo "Running lintering and formatting checks..."
black .
flake8 .

# Create a temporary directory for IMAGE_DATA_SOURCE for testing
TEST_IMAGE_DATA_SOURCE=$(mktemp -d -t dagster_input_dir_XXXXXX)
echo "Using temporary directory for IMAGE_DATA_SOURCE: ${TEST_IMAGE_DATA_SOURCE}"

# Ensure the temporary directory is cleaned up on exit
trap "rm -rf ${TEST_IMAGE_DATA_SOURCE}" EXIT

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

# Set IMAGE_DATA_SOURCE for tests
export IMAGE_DATA_SOURCE="${TEST_IMAGE_DATA_SOURCE}"

pytest \
  --cov=dagster_project \
  --cov-report=xml:coverage.xml \
  --junitxml=pytest-report.xml