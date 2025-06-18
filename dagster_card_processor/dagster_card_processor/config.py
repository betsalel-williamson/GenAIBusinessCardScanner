import os
from dagster import Config


class FileConfig(Config):
    input_dir: str = os.getenv("INPUT_DIR", "cards_to_process")
    output_dir: str = os.getenv("OUTPUT_DIR", "output")
    pdf_base_url: str = os.getenv("PDF_BASE_URL", "http://localhost:8000")
