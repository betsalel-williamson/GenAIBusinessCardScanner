import os
import json
from pathlib import Path
import google.generativeai as genai
from google.generativeai import protos as genai_protos
from dagster import ConfigurableResource, InitResourceContext, get_dagster_logger


class GeminiResource(ConfigurableResource):
    api_key: str
    prompt_template_path: str = "config/system_prompt_template.md"
    model_name: str = "gemini-1.5-flash"

    _model: genai.GenerativeModel
    _log = get_dagster_logger()

    def _generate_prompt_from_schema(self, schema: dict) -> str:
        # This helper method remains the same
        with open(self.prompt_template_path, "r") as f:
            template = f.read()

        field_definitions = []
        properties = schema.get("items", {}).get("properties", {})
        for key, value in properties.items():
            description = value.get("description", "No description available.")
            field_definitions.append(f"*   **`{key}`**: {description}")

        field_text = "\n".join(field_definitions)
        return template.replace("{{FIELD_DEFINITIONS}}", field_text)

    def _convert_json_schema_to_gemini_schema(
        self, json_dict: dict
    ) -> genai_protos.Schema:
        # This helper method remains the same
        if not json_dict:
            return None
        type_map = {
            "STRING": genai_protos.Type.STRING,
            "NUMBER": genai_protos.Type.NUMBER,
            "INTEGER": genai_protos.Type.INTEGER,
            "BOOLEAN": genai_protos.Type.BOOLEAN,
            "ARRAY": genai_protos.Type.ARRAY,
            "OBJECT": genai_protos.Type.OBJECT,
        }
        json_type_str = json_dict.get("type", "").upper()
        gemini_type = type_map.get(json_type_str)
        if not gemini_type:
            raise ValueError(f"Unsupported JSON schema type: {json_dict.get('type')}")
        kwargs = {
            "type": gemini_type,
            "description": json_dict.get("description"),
            "format": json_dict.get("format"),
        }
        if gemini_type == genai_protos.Type.OBJECT and "properties" in json_dict:
            kwargs["properties"] = {
                k: self._convert_json_schema_to_gemini_schema(v)
                for k, v in json_dict["properties"].items()
            }
        if gemini_type == genai_protos.Type.ARRAY and "items" in json_dict:
            kwargs["items"] = self._convert_json_schema_to_gemini_schema(
                json_dict["items"]
            )
        final_kwargs = {k: v for k, v in kwargs.items() if v is not None}
        return genai_protos.Schema(**final_kwargs)

    def setup_for_execution(self, context: InitResourceContext) -> None:
        genai.configure(api_key=self.api_key)
        self._model = genai.GenerativeModel(self.model_name)
        context.log.info(f"Gemini resource configured to use model: {self.model_name}")

    def process_pdf_batch(self, pdf_paths: list[str], schema: dict) -> list:
        system_prompt = self._generate_prompt_from_schema(schema)
        gemini_schema = self._convert_json_schema_to_gemini_schema(schema)

        prompt_parts = [system_prompt]
        for pdf_path in pdf_paths:
            pdf_filename = os.path.basename(pdf_path)
            pdf_bytes = Path(pdf_path).read_bytes()
            prompt_parts.append(f"Filename: {pdf_filename}")
            prompt_parts.append(
                genai_protos.Part(
                    inline_data=genai_protos.Blob(
                        mime_type="application/pdf", data=pdf_bytes
                    )
                )
            )

        # --- FIX #1: INCREASE MAX OUTPUT TOKENS ---
        generation_config = genai.GenerationConfig(
            response_mime_type="application/json",
            response_schema=gemini_schema,
            max_output_tokens=8192,  # Set a high limit to prevent truncation
        )

        response = self._model.generate_content(
            prompt_parts, generation_config=generation_config
        )

        # --- FIX #2: ADD ROBUST ERROR HANDLING ---
        try:
            return json.loads(response.text)
        except json.JSONDecodeError:
            self._log.error(
                "Failed to decode JSON from Gemini API response. The response may be truncated or invalid."
            )
            self._log.error(
                f"Problematic API Response Text:\n---\n{response.text}\n---"
            )
            # Return an empty list to allow the pipeline to continue without crashing,
            # while still logging the failure.
            return []
