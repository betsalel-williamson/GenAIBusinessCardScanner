---
title: 'Send Personalized Emails with a Template'
project_name: dagster_project
epic_name: email_sending_service
story_id: 12
labels: 'backend, dagster, postmark'
status: 'todo'
date_created: '2025-07-09T12:45:00-07:00'
date_verified_completed: ''
touched: '*'
---

- **As a** Marketing Manager,
- **I want** to send personalized emails using a pre-defined template,
- **so that** our outreach is professional and consistent.

## Acceptance Criteria

- The system can send an email to a single recipient using the Postmark API.
- The email content is populated from a template, with placeholders for personalization (e.g., recipient's name).
- The Postmark API key is configurable and not hard-coded.

## Metrics for Success

- **Primary Metric**: 100% of emails are successfully delivered to the Postmark API.
- **Secondary Metrics**: The time to send a single email is less than 2 seconds.
