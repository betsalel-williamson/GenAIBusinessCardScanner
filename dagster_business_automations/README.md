# Data Processing Pipeline

This application is the first stage of the GenAI Business Card Scanner system. It uses Dagster, dbt, and the Google Gemini API to read business card PDFs, extract structured information, and output the results as a JSON and CSV file.

## Prerequisites

- Python 3.12
- A Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/apikey).
- Google Sheets API enabled and Service Account Credentials configured (see below).

## Setup and Installation

**Important:** All commands should be run from the root of the `dagster_card_processor` directory.

1. **Set up Python Virtual Environment:**
    This project uses a virtual environment to manage dependencies. The virtual environment is created in the root of the monorepo.

    ```bash
    # From the dagster_card_processor directory
    python3 -m venv ../.venv
    source ../.venv/bin/activate
    pip install --upgrade pip
    pip install .
    ```

2. **Configure Environment Variables:**
    The pipeline needs your Google API key. Copy the sample file and edit it.

    ```bash
    cp sample.env .env
    ```

    Now, open `.env` in a text editor and set your `GOOGLE_API_KEY`. The other variables can typically be left as defaults.

3. **Google Sheets Service Account Setup:**
    To enable Google Sheets integration, you need to create a Google Cloud Platform (GCP) project, enable the Google Sheets API, and create a service account key. Follow these steps:

    a.  **Create a GCP Project:** If you don't have one, create a new project in the [Google Cloud Console](https://console.cloud.google.com/).

    b.  **Enable Google Sheets API:** In your GCP project, navigate to "APIs & Services" > "Library" and search for "Google Sheets API". Enable it.

    c.  **Create Service Account Key:**
        - In the GCP Console, go to "APIs & Services" > "Credentials".
        - Click "CREATE CREDENTIALS" > "Service account".
        - Follow the prompts to create a new service account. Grant it the "Editor" role (or a more restrictive role if preferred) for the Google Sheet you intend to access.
        - After creation, click on the service account email address.
        - Go to the "Keys" tab and click "ADD KEY" > "Create new key".
        - Select "JSON" as the key type and click "CREATE". This will download a JSON file to your computer. **Keep this file secure!**

    d.  **Share Google Sheet with Service Account:** The service account needs permission to access your Google Sheet. Share your Google Sheet with the service account's email address (found in the downloaded JSON key file under `client_email`).

    e.  **Place Credentials File:** Place the downloaded JSON key file in a secure location within your project, for example, `config/google_sheets_credentials.json`.

4. **Initialize dbt Project:**
    This step compiles the dbt models and generates a manifest file that Dagster needs to understand the dbt project structure.

    ```bash
    # Ensure your virtual environment is active
    dbt build --project-dir dbt_project --profiles-dir dbt_project
    ```

## How to Run

1. **Add PDFs:** Place your business card PDF files into the `cards_to_process/` directory.

2. **Launch Dagster:**
    From this directory (`dagster_card_processor/`), start the Dagster webserver.

    ```bash
    # Make sure your virtual environment is active
    # (source ../.venv/bin/activate)
    dagster dev
    ```

    The Dagster UI will be available at `http://localhost:3000`.

3. **Run the Pipeline:**
    - In the Dagster UI, go to the **Deployment -> Sensors** tab.
    - Find the `pdf_files_sensor` and toggle it on.
    - The sensor will automatically detect the new PDFs and create a processing run for each one. Runs are queued to respect API rate limits, so they will execute one by one.

## How to Test

To run the tests, execute the following command from the `dagster_card_processor` directory:

```bash
# Ensure your virtual environment is active
bash test.sh
```

## Pipeline Output

Once all pipeline runs are complete, the extracted data is available in the `output/` directory:

- `results.json`: An aggregated JSON file containing all extracted card data. This is the input for the validation tool.
- `results.csv`: A raw, unvalidated CSV export of the data, suitable for quick use or direct import into other systems.
