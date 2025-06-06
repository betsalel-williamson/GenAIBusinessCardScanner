import os
import json
import time
import google.generativeai as genai
from dagster import ConfigurableResource, InitResourceContext


class GeminiResource(ConfigurableResource):
    api_key: str
    prompt_template_path: str = "config/system_prompt_template.md"
    model_name: str = "gemini-1.5-flash"

    # The rest of the class remains exactly the same
    _model: genai.GenerativeModel

    def _generate_prompt_from_schema(self, schema: dict) -> str:
        with open(self.prompt_template_path, "r") as f:
            template = f.read()

        field_definitions = []
        properties = schema.get("items", {}).get("properties", {})
        for key, value in properties.items():
            description = value.get("description", "No description available.")
            field_definitions.append(f"*   **`{key}`**: {description}")

        field_text = "\n".join(field_definitions)
        return template.replace("{{FIELD_DEFINITIONS}}", field_text)

    def setup_for_execution(self, context: InitResourceContext) -> None:
        genai.configure(api_key=self.api_key)
        self._model = genai.GenerativeModel(self.model_name)
        context.log.info(f"Gemini resource configured to use model: {self.model_name}")

    def process_pdf(self, pdf_path: str, schema: dict) -> list:
        pdf_filename = os.path.basename(pdf_path)
        system_prompt = self._generate_prompt_from_schema(schema)
        uploaded_file = None
        try:
            uploaded_file = genai.upload_file(path=pdf_path, display_name=pdf_filename)
            generation_config = genai.GenerationConfig(
                response_mime_type="application/json", response_schema=schema
            )
            prompt_parts = [system_prompt, f"Filename: {pdf_filename}", uploaded_file]
            response = self._model.generate_content(
                prompt_parts, generation_config=generation_config
            )
            return json.loads(response.text)
        finally:
            if uploaded_file:
                time.sleep(1)
                genai.delete_file(uploaded_file.name)
