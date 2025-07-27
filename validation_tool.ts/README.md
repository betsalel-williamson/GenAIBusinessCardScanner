# Transcription Validation Tool

A web application for human-in-the-loop validation of structured data against original documents. Suitable for refining OCR output, transcribing scanned forms, or tasks requiring precise data correction.

## What It Does

This tool enables users to validate and edit JSON data records alongside their corresponding PDF documents. It provides a human touch to ensure data accuracy.

**Key Use Cases:**

- **OCR Correction:** Review and correct data extracted by Optical Character Recognition (OCR) systems.
- **Manual Transcription:** Transcribe data from scanned documents directly into a structured format.
- **Data Quality Assurance:** Verify and clean datasets against original source material.

## To use the tool

1. Place your JSON data files (each containing an array of records) into the `validation_tool.ts/json_data_source/` directory.
2. Ensure each record in your JSON includes a `source` field pointing to a PDF filename (e.g., `"source": "my_document.pdf"`).
3. Place the corresponding PDF files into `dagster_project/image_data_source/` (or adjust the static file serving path in `server.ts`).
4. Navigate to `http://localhost:7456` and start validating!

## Contributing

We welcome contributions! If you find a bug, have a feature request, or want to contribute code, please check out our [GitHub Issues](https://github.com/saul/businessCardGenAI/issues) and [Contributing Guidelines](https://github.com/saul/businessCardGenAI/blob/main/CONTRIBUTING.md).

## License

This project is open-source and available under the [MIT License](https://github.com/saul/businessCardGenAI/blob/main/LICENSE).

This project was bootstrapped from the [vite-typescript-ssr-react](https://github.com/jonluca/vite-typescript-ssr-react) template.
