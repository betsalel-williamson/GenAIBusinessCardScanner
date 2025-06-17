# Story 6: Committing a Validated Record

* **As a** Data Operator,
* **I want to** formally "Commit" a record once I am satisfied with its accuracy,
* **so that** I can mark it as ready for final processing and move to the next task.

## Acceptance Criteria

* A "Commit & Next" button is clearly visible.
* A dialog to confirm we are ready is displayed to ensure that we are actually done.
* Clicking it updates the record's status to `validated` in the database.
* The system automatically loads the next record that "Needs Validation" to maintain workflow momentum.
* If no records are left, a clear message is displayed.
