---
title: 'Side-by-Side Validation View'
project_name: validation_tool.ts
epic_name: core_validation
story_id: 3
labels: 'frontend, validation'
status: 'done'
date_created: '2025-06-17T11:39:41-07:00'
date_verified_completed: '2025-06-22T10:10:33-07:00'
touched: '**'
---

- **As a** Data Operator,
- **I want to** view a business card's image and its AI-extracted data fields side-by-side,
- **so that** I can efficiently compare the source document to the transcribed data.

## Acceptance Criteria

- The image is rendered clearly in one pane.
- Initially, the image is zoomed and centered to fill the screen without clipping.
- If the image contains multiple pages, both pages are displayed.
- If the image contains multiple pages in landscape aspect ratio, the pages are displayed top to bottom.
- If the image contains multiple pages in portrait aspect ratio, the pages are displayed left to right.
- I can pan and zoom the image to inspect details.
- The AI-extracted data is displayed as an editable form in another pane.
- The layout is clean and responsive.

## Metrics for Success

- **Primary Metric**: Time to validate a single record is under 30 seconds.
- **Secondary Metrics**: User satisfaction score > 8/10.
