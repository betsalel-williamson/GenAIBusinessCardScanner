# Story 3: Side-by-Side Validation View

* **As a** Data Operator,
* **I want to** view a business card's image and its AI-extracted data fields side-by-side,
* **so that** I can efficiently compare the source document to the transcribed data.

## Acceptance Criteria

* The image is rendered clearly in one pane.
* Initially, the image is zoomed and centered to fill the screen without clipping
* If the image contains multiple pages, both pages are displayed.
* If the image contains multiple pages in landsacpe aspect ratio, the pages are displayed top top bottom
* If the image contains multipl pages in portrait aspect ratio, the pages are displayed left to right
* I can pan and zoom the image to inspect details.
* The AI-extracted data is displayed as an editable form in another pane.
* The layout is clean and responsive.
