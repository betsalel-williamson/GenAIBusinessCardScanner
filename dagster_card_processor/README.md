# Data Processing Pipeline

This application is the first stage of the GenAI Business Card Scanner system. It uses Dagster, dbt, and the Google Gemini API to read business card PDFs, extract structured information, and output the results as a JSON and CSV file.

## Prerequisites

- Python 3.12
- A Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/apikey).

## Setup and Installation

1. **Navigate to Directory:**
    Ensure you are in this directory (`dagster_card_processor`).

2. **Configure Environment Variables:**
    The pipeline needs your Google API key. Copy the sample file and edit it.

    ```bash
    cp sample.env .env
    ```

    Now, open `.env` in a text editor and set your `GOOGLE_API_KEY`. The other variables can typically be left as defaults.

3. **Set up Python Virtual Environment:**

    ```bash
    python3 -m venv .venv
    source .venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    ```

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
    # (source .venv/bin/activate)
    dagster dev
    ```

    The Dagster UI will be available at `http://localhost:3000`.

3. **Run the Pipeline:**
    - In the Dagster UI, go to the **Deployment -> Sensors** tab.
    - Find the `pdf_files_sensor` and toggle it on.
    - The sensor will automatically detect the new PDFs and create a processing run for each one. Runs are queued to respect API rate limits, so they will execute one by one.

## Pipeline Output

Once all pipeline runs are complete, the extracted data is available in the `output/` directory:

- `results.json`: An aggregated JSON file containing all extracted card data. This is the input for the validation tool.
- `results.csv`: A raw, unvalidated CSV export of the data, suitable for quick use or direct import into other systems.
