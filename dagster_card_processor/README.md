# README

## Rnnning

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
cd dagster_card_processor/
pip install -r requirements.txt
cd dbt_project
dbt build --project-dir dbt_project --profiles-dir dbt_project

python -m http.server #TODO: detatch in separate process
dagster dev
```
