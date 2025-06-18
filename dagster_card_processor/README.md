# GenAI Business Card Scanner

## 1. Overview

This project uses Dagster and dbt to run a data pipeline that extracts information from business card PDFs. It uses the Google Gemini API to parse the documents, loads the structured data into a DuckDB database, and exports the final results to a CSV file.

The pipeline is designed to be event-driven and scalable:

- A Dagster sensor detects new PDF files in a designated folder.
- Each PDF is processed in parallel, with rate limiting to respect API quotas.
- dbt models transform and store the final, clean data.

## 2. Prerequisites

- Python 3.12
- A Google Gemini API Key. Get one from [Google AI Studio](https://aistudio.google.com/apikey).

## 3. Setup

All commands should be run from the project's root directory.

### **A. Create Virtual Environment**

```bash
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
```

### **B. Install Dependencies**

```bash
pip install -r requirements.txt
```

### **C. Configure Environment Variables**

Create a `.env` file in the project root by copying the sample.

```bash
cp sample.env .env
```

Edit `.env` and add your `GOOGLE_API_KEY`. See the comments in `sample.env` for other configuration options.

### **D. Initialize dbt Project**

This step compiles the dbt models and generates a `manifest.json` file that Dagster uses to understand the dbt project.

```bash
dbt build --project-dir dbt_project --profiles-dir dbt_project
```

## 4. Usage

### **A. Add PDF Files**

Place your business card PDFs into the `cards_to_process/` directory. Each file should represent one business card.

### **B. Launch Dagster**

```bash
dagster dev
```

The Dagster UI will be available at `http://localhost:3000`.

### **C. Enable the Sensor**

1. Navigate to **Deployment > Sensors**.
2. Find the `pdf_files_sensor` and toggle it on.

The sensor will now automatically detect and queue a processing run for each new PDF file.

## 5. Output

The pipeline generates the following key files in the `output/` directory:

- `processed_*.json`: An individual JSON file for each successfully processed card.
- `results.json`: A single JSON file containing an aggregation of all processed cards.
- `results.csv`: The final, clean dataset ready for use.

The raw data is also loaded into a DuckDB database at `dbt_project/business_cards.duckdb`.

## 6. Configuration

Pipeline behavior is controlled by environment variables defined in the `.env` file.

To configure the project, copy `sample.env` to `.env` and modify the values. All available parameters are documented with comments in the `sample.env` file.

## 7. Project Structure

```text
.
├── cards_to_process/       # Input: Place source PDFs here.
├── config/                 # Contains the system prompt template for the AI.
├── dagster_card_processor/ # The core Dagster application code.
├── dbt_project/            # The dbt project for data transformation.
├── output/                 # Output: Contains all generated files (JSON, CSV).
├── .env                    # Local environment configuration (you create this).
├── dagster.yaml            # Dagster instance configuration (e.g., rate limiting).
├── pyproject.toml          # Python project definition for Dagster.
└── README.md               # This file.
```
