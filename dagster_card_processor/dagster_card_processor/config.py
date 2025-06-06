import os
from dagster import Config


class BatchAssetConfig(Config):
    input_dir: str = os.getenv("INPUT_DIR", "cards_to_process")
    output_dir: str = os.getenv("OUTPUT_DIR", "output")
    max_batch_size: int = int(os.getenv("MAX_BATCH_SIZE", "10"))
    pdf_base_url: str = os.getenv("PDF_BASE_URL", "http://localhost:8000")
    pdf_filenames: list[str]
