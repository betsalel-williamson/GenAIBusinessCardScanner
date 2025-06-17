# Story 1: Uploading Business Cards

* **As a** Data Operator,
* **I want to** upload one or more PDF business cards through the web interface,
* **so that** they can be queued for AI processing without me needing to access the server's file system.

## Acceptance Criteria

* The homepage displays a file upload area (e.g., button, drag-and-drop zone).
* I can select multiple PDF files at once from my local machine.
* The UI provides clear feedback for each file's upload status (success, failure, in-progress).
* Successfully uploaded PDFs are stored in the `cards_to_process` directory for Dagster to detect.
