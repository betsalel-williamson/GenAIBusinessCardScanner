-- models/staging/stg_cards_data.sql

-- In a CI environment, dbt will be run with the 'is_ci_run' variable set to true.
-- In that case, we select from the sample data provided by the seed file.
{% if var('is_ci_run', default=false) %}

select
    *
from {{ ref('stg_cards_data_sample') }}

-- In a production run (triggered by Dagster), the 'is_ci_run' variable will be false or undefined.
-- In that case, we select from the JSON file whose path is passed in by the Dagster asset.
{% else %}

select
    *
from read_json_auto('{{ var("validated_json_path") }}')

{% endif %}
