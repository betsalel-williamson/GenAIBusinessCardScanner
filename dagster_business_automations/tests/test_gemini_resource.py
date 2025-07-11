import pytest
from unittest.mock import patch, MagicMock
import os
from dagster_card_processor.defs import GeminiResource


@patch("google.generativeai.GenerativeModel")
def test_gemini_resource(mock_generative_model):
    """Test the Gemini resource."""
    mock_model_instance = MagicMock()
    mock_generative_model.return_value = mock_model_instance
    mock_model_instance.generate_content.return_value.text = '{"foo": "bar"}'

    import tempfile
    import os

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp_pdf:
        tmp_pdf.write(b"dummy_pdf_content")
        tmp_pdf_path = tmp_pdf.name

    try:
        resource = GeminiResource(api_key="test_api_key")
        resource.setup_for_execution(MagicMock())
        result = resource.process_single_pdf(tmp_pdf_path, {})

        assert result == {"foo": "bar"}
    finally:
        os.remove(tmp_pdf_path)


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


def test_generate_prompt_from_schema(mock_prompt_template, sample_schema):
    """
    Tests that the Gemini resource can correctly generate a system prompt
    from a given JSON schema. This test is robust to changes in the underlying
    schema.yml file.
    """
    resource = GeminiResource(
        api_key="test-key",
        prompt_template_path=mock_prompt_template,
    )

    # Use the schema generated from the mock manifest via fixture
    generated_prompt = resource._generate_prompt_from_schema(sample_schema)

    # Dynamically verify that every property in the sample schema is correctly
    # represented in the generated prompt.
    for key, prop_details in sample_schema["properties"].items():
        expected_line = f"*   **`{key}`**: {prop_details['description']}"
        assert (
            expected_line in generated_prompt
        ), f"Expected line for '{key}' not found or incorrect in generated prompt."

    # General prompt structure checks
    assert "# Instructions" in generated_prompt
    assert "{{FIELD_DEFINITIONS}}" not in generated_prompt


def test_process_single_pdf_handles_json_decode_error(mocker, sample_schema):
    """
    Tests that if the Gemini API returns malformed JSON, the resource logs an
    error and returns an empty dictionary instead of crashing.
    """
    # Mock all external dependencies of the method
    mocker.patch.object(
        GeminiResource, "_generate_prompt_from_schema", return_value="Test Prompt"
    )
    mocker.patch.object(
        GeminiResource,
        "_convert_json_schema_to_gemini_schema",
        return_value=MagicMock(),
    )
    mocker.patch(
        "pathlib.Path.read_bytes",
        return_value=b"fake-pdf-bytes",
    )

    # Mock the Gemini model's response
    mock_response = MagicMock()
    mock_response.text = "this is not valid json"  # Malformed response
    mock_model = MagicMock()
    mock_model.generate_content.return_value = mock_response

    resource = GeminiResource(api_key="test-key")
    resource._model = mock_model  # Inject the mock model

    # Spy on the logger
    log_spy = mocker.spy(resource._log, "error")

    # Run the method
    pdf_path = "fake/path.pdf"
    result = resource.process_single_pdf(pdf_path, schema=sample_schema)

    # Assertions
    assert result == {}

    # The code logs the basename of the file.
    expected_filename = os.path.basename(pdf_path)
    log_spy.assert_any_call(f"Failed to decode JSON for file {expected_filename}.")
    log_spy.assert_any_call(
        "Problematic API Response Text:\n---\nthis is not valid json\n---"
    )
