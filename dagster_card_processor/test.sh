#!/usr/bin/env sh

GOOGLE_API_KEY=ci_test_key MODEL_NAME=ci_test_model pytest \
            --cov=dagster_card_processor \
            --cov-report=xml:coverage.xml \
            --junitxml=pytest-report.xml
