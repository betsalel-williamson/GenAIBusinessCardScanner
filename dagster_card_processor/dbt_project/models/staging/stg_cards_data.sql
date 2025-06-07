-- This model now reads the JSON file and loads it into the table.
-- The file path is passed in as a variable from the Dagster asset.
select
    *
from read_json_auto('{{ var("validated_json_path") }}')
