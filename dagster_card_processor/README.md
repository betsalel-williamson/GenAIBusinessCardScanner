# README

## Rnnning

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
dbt build --project-dir dbt_project --profiles-dir dbt_project
```
