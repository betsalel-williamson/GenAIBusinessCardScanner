---
id: task-36
title: Side-by-Side Validation View
status: done
assignee: []
created_date: '2025-08-06 21:37'
updated_date: '2025-08-06 21:37'
labels:
  - 'project:validation_tool.ts'
  - 'epic:core_validation'
  - 'type:user-story'
  - 'original_id:3'
  - frontend
  - validation
dependencies: []
---

## Description

- **As a** Data Operator, - **I want to** view a business card's image and its AI-extracted data fields side-by-side, - **so that** I can efficiently compare the source document to the transcribed data. ## Metrics for Success - **Primary Metric**: Time to validate a single record is under 30 seconds. - **Secondary Metrics**: User satisfaction score > 8/10.

## Acceptance Criteria

- [ ] The image is rendered clearly in one pane
- [ ] Initially
- [ ] the image is zoomed and centered to fill the screen without clipping
- [ ] If the image contains multiple pages
- [ ] both pages are displayed
- [ ] If the image contains multiple pages in landscape aspect ratio
- [ ] the pages are displayed top to bottom
- [ ] If the image contains multiple pages in portrait aspect ratio
- [ ] the pages are displayed left to right
- [ ] I can pan and zoom the image to inspect details
- [ ] The AI-extracted data is displayed as an editable form in another pane
- [ ] The layout is clean and responsive.
