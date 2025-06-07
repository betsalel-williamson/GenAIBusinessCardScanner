# BusinessCardGenAI

This is a dagster-dbt project to process business cards in PDF format and output them in as well formatted data in a CSV file for further use in other systems.

The format for the PDF files is one card per file, multiple pages per card is fine.

Place all PDF files to scan in `dagster_card_processor/cards_to_process`. Each file must have a unique name.

## How To Run

Setup env file input [GeminiAPI key](https://aistudio.google.com/apikey).

Activate venv:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
```

To get code hints working set interpreter in VS Code to the venv python binary.

Install requirements for project:

```bash
cd dagster_card_processor/
pip install -r requirements.txt
```

First time, build out manifest.json file:

```bash
cd dagster_card_processor/dbt_project
dbt build --project-dir dbt_project --profiles-dir dbt_project
```

Run webserver in `dagster_card_processor` directory:

```bash
python -m http.server #TODO: detatch in separate process
```

Launch debugger in VS Code or manually run dagster.

Enable the sensor in dagster and the system will process the files in a batch manner. If using a free version of Gemini, the system is rate limited and this project will respect the rate limit.

Export data from DuckDB into CSV format:

```bash
duckdb dagster_card_processor/dbt_project/target/dbt.duckdb
```

```SQL
copy (SELECT
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
  products,
FROM stg_cards_data) TO 'output.csv' (HEADER, DELIMITER ',');```
