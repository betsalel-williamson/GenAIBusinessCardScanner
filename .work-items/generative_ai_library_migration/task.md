# Task: Migrate from `google-generativeai` to `google-genai`

**Objective:** Replace the deprecated `google-generativeai` library with the recommended `google-genai` SDK in the `dagster_project` to ensure continued support and compatibility.

**Acceptance Criteria:**

* `google-generativeai` is removed from `pyproject.toml`.
* `google-genai` is added to `pyproject.toml` with an appropriate version.
* All code references to `google-generativeai` are updated to use `google-genai`.
* The `dagster_project` runs without errors.
* All existing tests pass.

**Requirements Traceability:** This task addresses the technical debt of using a deprecated library and ensures the project's long-term maintainability and compatibility.

**Test Strategy:**

1. Run `uv pip install -U .` to install the new dependencies.
2. Execute the existing test suite (`./test.sh`) to ensure no regressions are introduced.
3. Manually verify the functionality of any components that directly use the generative AI library.

**Additional Notes:**

* `dbt-core` was held back at version `1.10.6` due to a `protobuf` version conflict with `google-generativeai`. This restriction will be removed once `google-generativeai` is successfully replaced with `google-genai` and `dbt-core` can be updated to its latest version.
