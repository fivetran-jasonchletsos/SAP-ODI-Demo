{{ config(
    materialized='table',
    table_type='iceberg',
    format='parquet'
) }}

select
    customer_id,
    customer_name,
    country,
    city,
    region,
    case
        when country in ('US','CA','MX') then 'NA'
        when country in ('DE','FR','GB','ES','IT','NL') then 'EMEA'
        when country in ('JP','CN','SG','AU','KR','IN') then 'APAC'
        when country in ('BR','AR','CL') then 'LATAM'
        else 'OTHER'
    end                                            as region_bucket,
    loaded_at
from {{ ref('stg_sap__kna1') }}
