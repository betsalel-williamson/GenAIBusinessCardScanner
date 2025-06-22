import json
import pytest
from unittest.mock import patch, MagicMock
import os
from dagster_card_processor.resources import GeminiResource

# Sample schema to test prompt generation
SAMPLE_SCHEMA = {
    "type": "object",
    "items": { # The prompt generator looks inside 'items'
        "properties": {
            "company": {"description": "The name of the company."},
            "email": {"description": "Contact's email."},
            "website": {"description": "Company website URL."}
        }
    }
}

@pytest.fixture
def mock_prompt_template(tmp_path):
    """Creates a temporary prompt template file."""
    template_content = """
# Instructions
Extract these fields:
{{FIELD_DEFINITIONS}}
    """
    template_path = tmp_path / "prompt.md"
    template_path.write_text(template_content)
    return str(template_path)


def test_generate_prompt_from_schema(mock_prompt_template):
    """
    Tests that the Gemini resource can correctly generate a system prompt
    from a given JSON schema.
    """
    resource = GeminiResource(
        api_key="test-key",
        prompt_template_path=mock_prompt_template,
    )

    # The method is private, but we test it to ensure prompt engineering is correct.
    # This is a valid reason to break encapsulation for testing purposes.
    generated_prompt = resource._generate_prompt_from_schema(SAMPLE_SCHEMA)

    # Assertions
    assert "*   **`company`**: The name of the company." in generated_prompt
    assert "*   **`email`**: Contact's email." in generated_prompt
    assert "*   **`website`**: Company website URL." in generated_prompt
    assert "# Instructions" in generated_prompt
    assert "{{FIELD_DEFINITIONS}}" not in generated_prompt

def test_process_single_pdf_handles_json_decode_error(mocker):
    """
    Tests that if the Gemini API returns malformed JSON, the resource logs an
    error and returns an empty dictionary instead of crashing.
    """
    # Mock all external dependencies of the method
    mocker.patch.object(GeminiResource, '_generate_prompt_from_schema', return_value="Test Prompt")
    mocker.patch.object(GeminiResource, '_convert_json_schema_to_gemini_schema', return_value=MagicMock())
    mocker.patch('dagster_card_processor.resources.Path.read_bytes', return_value=b'fake-pdf-bytes')

    # Mock the Gemini model's response
    mock_response = MagicMock()
    mock_response.text = "this is not valid json" # Malformed response
    mock_model = MagicMock()
    mock_model.generate_content.return_value = mock_response

    resource = GeminiResource(api_key="test-key")
    resource._model = mock_model # Inject the mock model

    # Spy on the logger
    log_spy = mocker.spy(resource._log, 'error')

    # Run the method
    pdf_path = "fake/path.pdf"
    result = resource.process_single_pdf(pdf_path, schema={})

    # Assertions
    assert result == {}

    # The code logs the basename of the file.
    expected_filename = os.path.basename(pdf_path)
    log_spy.assert_any_call(f"Failed to decode JSON for file {expected_filename}.")
    log_spy.assert_any_call("Problematic API Response Text:\n---\nthis is not valid json\n---")
