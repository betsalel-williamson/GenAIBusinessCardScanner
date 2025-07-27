import os
from dagster import Config


class FileConfig(Config):
    input_dir: str = os.getenv("IMAGE_DATA_SOURCE", "/mnt/image_data_source")
    output_dir: str = os.getenv("JSON_DATA_SOURCE", "output")
    pdf_base_url: str = os.getenv("PDF_BASE_URL", "http://localhost:8000")
