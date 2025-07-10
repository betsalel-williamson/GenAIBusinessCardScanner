#!/usr/bin/env sh

set -e
set -a
source .env.test
set +a

pytest \
            --cov=dagster_card_processor \
            --cov-report=xml:coverage.xml \
            --junitxml=pytest-report.xml


