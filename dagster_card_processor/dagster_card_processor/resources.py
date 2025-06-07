import os
import json
from pathlib import Path
import time
import google.generativeai as genai
from google.generativeai import protos as genai_protos
from google.api_core import exceptions as google_exceptions
from dagster import ConfigurableResource, InitResourceContext, get_dagster_logger, RetryRequested


class GeminiResource(ConfigurableResource):
    api_key: str
    prompt_template_path: str = "config/system_prompt_template.md"
    model_name: str = "gemini-1.5-flash"

    _model: genai.GenerativeModel
    _log = get_dagster_logger()

    def _generate_prompt_from_schema(self, schema: dict) -> str:

        with open(self.prompt_template_path, 'r') as f:
            template = f.read()

        field_definitions = []
        properties = schema.get("items", {}).get("properties", {})
        for key, value in properties.items():
            description = value.get("description", "No description available.")
            field_definitions.append(f"*   **`{key}`**: {description}")

        field_text = "\n".join(field_definitions)
        return template.replace("{{FIELD_DEFINITIONS}}", field_text)

    def _convert_json_schema_to_gemini_schema(self, json_dict: dict) -> genai_protos.Schema:

        if not json_dict: return None
        type_map = {
            "STRING": genai_protos.Type.STRING, "NUMBER": genai_protos.Type.NUMBER,
            "INTEGER": genai_protos.Type.INTEGER, "BOOLEAN": genai_protos.Type.BOOLEAN,
            "ARRAY": genai_protos.Type.ARRAY, "OBJECT": genai_protos.Type.OBJECT,
        }
        json_type_str = json_dict.get("type", "").upper()
        gemini_type = type_map.get(json_type_str)
        if not gemini_type: raise ValueError(f"Unsupported JSON schema type: {json_dict.get('type')}")
        kwargs = {"type": gemini_type, "description": json_dict.get("description"), "format": json_dict.get("format")}
        if gemini_type == genai_protos.Type.OBJECT and "properties" in json_dict:
            kwargs["properties"] = {k: self._convert_json_schema_to_gemini_schema(v) for k, v in json_dict["properties"].items()}
        if gemini_type == genai_protos.Type.ARRAY and "items" in json_dict:
            kwargs["items"] = self._convert_json_schema_to_gemini_schema(json_dict["items"])
        final_kwargs = {k: v for k, v in kwargs.items() if v is not None}
        return genai_protos.Schema(**final_kwargs)

    def setup_for_execution(self, context: InitResourceContext) -> None:
        genai.configure(api_key=self.api_key)
        self._model = genai.GenerativeModel(self.model_name)
        context.log.info(f"Gemini resource configured to use model: {self.model_name}")

    # Revert to a single-file processing method
    def process_single_pdf(self, pdf_path: str, schema: dict) -> dict:
        pdf_filename = os.path.basename(pdf_path)
        system_prompt = self._generate_prompt_from_schema(schema)
        gemini_schema = self._convert_json_schema_to_gemini_schema(schema)

        pdf_bytes = Path(pdf_path).read_bytes()
        file_part = genai_protos.Part(inline_data=genai_protos.Blob(
            mime_type="application/pdf",
            data=pdf_bytes
        ))

        prompt_parts = [system_prompt, f"Filename: {pdf_filename}", file_part]

        generation_config = genai.GenerationConfig(
            response_mime_type="application/json",
            response_schema=gemini_schema,
            max_output_tokens=8192,
        )

        try:
            response = self._model.generate_content(
                prompt_parts,
                generation_config=generation_config
            )
            return json.loads(response.text)

        except google_exceptions.ResourceExhausted as e:
            # The API is telling us we're rate-limited.
            # We can inspect the error for a suggested delay.
            retry_delay = 60  # Default to 60 seconds if not found
            if e.retry and e.retry.delay:
                retry_delay = e.retry.delay.total_seconds()

            self._log.warning(
                f"Rate limit exceeded for {pdf_filename}. The API suggested a delay of "
                f"{retry_delay} seconds. Waiting and then requesting a retry from Dagster."
            )
            # Wait for the suggested amount of time
            time.sleep(retry_delay)
            # Raise Dagster's special exception to trigger a retry for this step
            raise RetryRequested(max_retries=5)

        except json.JSONDecodeError:
            self._log.error(f"Failed to decode JSON for file {pdf_filename}.")
            self._log.error(f"Problematic API Response Text:\n---\n{response.text}\n---")
            return {}
