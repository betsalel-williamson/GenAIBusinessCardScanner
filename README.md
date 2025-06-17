# GenAIBusinessCardScanner

## Overview

GenAIBusinessCardScanner is a project leveraging Dagster and dbt to extract information from business cards in PDF format. It processes these PDFs, uses a Generative AI model (Google Gemini) to interpret the card data, and structures this information into a CSV file suitable for import into other systems.

Key features:

- PDF parsing for business card images.
- Data extraction and structuring using Google Gemini API.
- Data transformation and modeling with dbt.
- Orchestration and monitoring with Dagster.
- Outputs clean, structured data in CSV format.

## Prerequisites

- Python 3.8+
- A Google Gemini API Key. You can obtain one from [Google AI Studio](https://aistudio.google.com/apikey).
- `dbt` command-line tool installed (covered in setup).
- `duckdb` CLI (for manual data export, optional if data is consumed directly from the database).

## Setup and Installation

1. **Clone the Repository (if you haven't already):**

    ```bash
    git clone <repository-url>
    cd GenAIBusinessCardScanner
    ```

2. **Set up Python Virtual Environment:**
    It's highly recommended to use a virtual environment.

    ```bash
    python3 -m venv .venv
    source .venv/bin/activate
    pip install --upgrade pip
    ```

    *Tip: For improved IDE support (e.g., VS Code), set your Python interpreter to `.venv/bin/python`.*

3. **Configure Environment Variables:**
    The application requires your Google Gemini API key. Create a `.env` file in the `dagster_card_processor/` directory:

    ```bash
    # In dagster_card_processor/.env
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```

4. **Install Python Dependencies:**
    Navigate to the Dagster project directory and install the required packages.

    ```bash
    cd dagster_card_processor
    pip install -r requirements.txt
    ```

5. **Initialize dbt Project:**
    The dbt project (located in `dagster_card_processor/dbt_project/`) needs to be built. This compiles models, runs tests, and generates the `manifest.json` used by Dagster.

    Ensure you are in the `dagster_card_processor/` directory. This command assumes your `profiles.yml` for dbt is located within the `dbt_project/` subdirectory (i.e., at `dagster_card_processor/dbt_project/profiles.yml`).

    ```bash
    # Ensure current directory is dagster_card_processor/
    dbt build --project-dir dbt_project --profiles-dir dbt_project
    ```

    *Note: If your `profiles.yml` is located elsewhere (e.g., `~/.dbt/profiles.yml`), dbt might pick it up automatically, or you might need to adjust the `--profiles-dir` argument or use the `DBT_PROFILES_DIR` environment variable.*

## Running the Project

1. **Prepare PDF Files:**
    - Place all PDF business card files into the `dagster_card_processor/cards_to_process/` directory.
    - Each PDF file should represent a single business card (multiple pages per card are acceptable).
    - Ensure each PDF file has a unique name.

2. **Launch Dagster Webserver:**
    From the `dagster_card_processor/` directory, start the Dagster webserver/UI:

    ```bash
    dagster dev
    ```

    The Dagster UI will typically be available at `http://localhost:3000`.

3. **Enable the Sensor in Dagster:**
    - Open the Dagster UI in your browser.
    - Navigate to the "Sensors" tab.
    - Locate the sensor responsible for detecting new PDF files and enable it.
    - The system will then begin to process files from the `cards_to_process/` directory in batches.
    - *Note: If you are using a free tier of the Gemini API, the project includes logic to respect rate limits, which may result in slower processing.*

## Exporting Processed Data

After the Dagster pipeline has processed the business cards and the dbt models have run, the structured data will reside in the DuckDB database (typically located at `dagster_card_processor/dbt_project/*.duckdb`).

To export this data to a CSV file:

1. **Open the DuckDB CLI:**
    Navigate to the `dagster_card_processor/` directory (or adjust the path to `*.duckdb` accordingly) and run:

    ```bash
    duckdb dbt_project/*.duckdb
    ```

2. **Execute the COPY Command:**
    In the DuckDB prompt, run the following SQL query. This will create an `output.csv` file in the directory from which you launched the `duckdb` CLI (likely `dagster_card_processor/`).

```SQL
COPY (
  SELECT
    company,
    website,
    prefix,
    full_name,
    first_name,
    last_name,
    title,
    address_1,
    address_2,
    address_3,
    city,
    state_or_state_code,
    country_or_country_code,
    zip_code_or_post_code,
    phone,
    extension,
    cell,
    email,
    retailer_type,
    source,
    date_imported,
    contact_type,
    notes,
    time_imported,
    products
  FROM stg_cards_data
) TO 'output.csv' (HEADER, DELIMITER ',');
```

## Project Structure

- `dagster_card_processor/`: Main app directory
  - `dagster_card_processor/`: Contains the core Dagster application code, assets, jobs, and sensors.
  - `cards_to_process/`: Directory where input PDF files should be placed.
  - `dbt_project/`: Contains the dbt models, seeds, and configurations.
  - `.env`: (You create this) For storing environment variables like API keys.
