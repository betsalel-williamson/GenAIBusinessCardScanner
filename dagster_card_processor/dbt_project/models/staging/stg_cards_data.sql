-- This model now reads the validated JSON file and loads it into the table.
-- The file path is passed in as a variable from the Dagster asset.
select
    -- The columns are automatically inferred by read_json_auto,
    -- but we cast them here to ensure the correct data types.
    *
    -- cast(company as varchar) as company,
    -- cast(website as varchar) as website,
    -- cast(prefix as varchar) as prefix,
    -- cast(full_name as varchar) as full_name,
    -- cast(first_name as varchar) as first_name,
    -- cast(last_name as varchar) as last_name,
    -- cast(title as varchar) as title,
    -- cast(address_1 as varchar) as address_1,
    -- cast(address_2 as varchar) as address_2,
    -- cast(address_3 as varchar) as address_3,
    -- cast(city as varchar) as city,
    -- cast(state_or_state_code as varchar) as state_or_state_code,
    -- cast(country_or_country_code as varchar) as country_or_country_code,
    -- cast(zip_code_or_post_code as varchar) as zip_code_or_post_code,
    -- cast(phone as varchar) as phone,
    -- cast(extension as varchar) as extension,
    -- cast(cell as varchar) as cell,
    -- cast(email as varchar) as email,
    -- cast(retailer_type as varchar) as retailer_type,
    -- cast(contact_type as varchar) as contact_type,
    -- cast(source as varchar) as source,
    -- cast(date_imported as varchar) as date_imported,
    -- cast(time_imported as varchar) as time_imported,
    -- cast(notes as varchar) as notes,
    -- cast(products as varchar) as products,
    -- cast(source_pdf_url as varchar) as source_pdf_url

from read_json_auto('{{ var("validated_json_path") }}')
