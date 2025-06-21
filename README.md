# [GenAI Business Card Scanner](https://github.com/betsalel-williamson/GenAIBusinessCardScanner)

<p align="center">
  A complete system for extracting structured data from business card PDFs using AI and validating it with a human-in-the-loop web interface.
</p>

<p align="center">
    <a href="https://github.com/betsalel-williamson/GenAIBusinessCardScanner/blob/main/LICENSE">
        <img alt="License" src="https://img.shields.io/github/license/betsalel-williamson/GenAIBusinessCardScanner?style=flat-square&color=blue">
    </a>
    <a href="https://github.com/betsalel-williamson/GenAIBusinessCardScanner/actions/workflows/ci.yml">
        <img alt="CI Status" src="https://github.com/betsalel-williamson/GenAIBusinessCardScanner/actions/workflows/ci.yml/badge.svg">
    </a>
    <img alt="Language" src="https://img.shields.io/github/languages/count/betsalel-williamson/GenAIBusinessCardScanner?style=flat-square">
    <img alt="Language" src="https://img.shields.io/github/languages/top/betsalel-williamson/GenAIBusinessCardScanner?style=flat-square">
</p>

## Overview

This project provides a comprehensive, two-part system for processing business cards:

1. **Data Processing Pipeline (`dagster_card_processor`):** A Python-based pipeline using Dagster, dbt, and the Google Gemini API to automatically extract and structure information from PDF files.
2. **Validation UI (`validation_tool.ts`):** A Node.js and React application that provides a web interface for a human to efficiently review, correct, and validate the AI-extracted data.

### Core Workflow

The system is designed for a sequential workflow:

```text
PDFs -> [ 1. Dagster Pipeline ] -> results.json -> [ 2. Validation UI ] -> Validated DB
```

## Prerequisites

- Python 3.12
- Node.js v20+
- `pnpm` (run `npm install -g pnpm`)
- A Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/apikey).

## Getting Started

This project is a monorepo containing two separate applications. Please follow the setup instructions in each application's respective `README.md` file.

1. **Set up the Data Processing Pipeline:**
    - [**`./dagster_card_processor/README.md`**](./dagster_card_processor/README.md)

2. **Set up the Validation UI:**
    - [**`./validation_tool.ts/README.md`**](./validation_tool.ts/README.md)

## Usage

After completing the setup for both applications, follow this workflow:

1. **Run the Pipeline:** Add your business card PDFs to `dagster_card_processor/cards_to_process/` and run the Dagster pipeline as described in its README. This will produce a `results.json` file in `dagster_card_processor/output/`.

2. **Prepare for Validation:** Copy the output file into the validation tool's ingestion directory:

    ```bash
    cp dagster_card_processor/output/results.json validation_tool.ts/data_source/
    ```

3. **Validate Data:** Start the validation UI server. In the web interface, ingest the `results.json` file and proceed to validate each record.

## Contributing

Contributions are welcome. Please refer to the issues tab for areas where you can help.

## License

This project is licensed under the [MIT License](./LICENSE).
