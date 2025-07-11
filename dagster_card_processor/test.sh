#!/usr/bin/env sh

set -e

cd $(dirname "$0")

set -a
source .env.test
set +a

pytest \
  --cov=dagster_card_processor \
  --cov-report=xml:coverage.xml \
  --junitxml=pytest-report.xml


