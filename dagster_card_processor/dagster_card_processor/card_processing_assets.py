import os
import json
from dagster import asset, AssetExecutionContext, Config, DynamicPartitionsDefinition
from .resources import GeminiResource
from .schema_assets import response_schema_json


class AssetConfig(Config):
    input_dir: str = "cards_to_process"
    output_dir: str = "output"


pdf_partitions = DynamicPartitionsDefinition(name="pdf_files")


@asset(partitions_def=pdf_partitions)
def processed_card_json(
    context: AssetExecutionContext,
    config: AssetConfig,
    gemini: GeminiResource,
    response_schema_json: dict,
) -> list:
    pdf_filename = context.partition_key
    pdf_path = os.path.join(config.input_dir, pdf_filename)
    context.log.info(f"Processing card from: {pdf_path}")

    extracted_data = gemini.process_pdf(pdf_path, schema=response_schema_json)

    context.add_output_metadata(
        {
            "num_records": len(extracted_data),
            "preview": json.dumps(extracted_data, indent=2),
        }
    )
    return extracted_data


@asset
def aggregated_card_data_json(
    context: AssetExecutionContext,
    config: AssetConfig,
    processed_card_json: dict[str, list],
) -> None:
    context.log.info(
        f"Aggregating results from {len(processed_card_json)} processed cards."
    )
    all_results = [
        item
        for partition_data in processed_card_json.values()
        for item in partition_data
    ]

    output_path = os.path.join(config.output_dir, "results.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)

    context.log.info(f"Results saved to {output_path}")
    context.add_output_metadata(
        {"total_records": len(all_results), "output_path": output_path}
    )
