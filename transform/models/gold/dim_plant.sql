{{ config(
    materialized='table',
    table_type='iceberg',
    format='parquet'
) }}

with plants as (
    select distinct plant_id from {{ ref('stg_sap__marc') }}
),

labels as (
    select '1000' as plant_id, 'Houston'    as plant_name, 'NA'    as region union all
    select '1010',              'Chicago',                  'NA'           union all
    select '2000',              'Stuttgart',                'EMEA'         union all
    select '2010',              'Lyon',                     'EMEA'         union all
    select '3000',              'Yokohama',                 'APAC'         union all
    select '3010',              'Shanghai',                 'APAC'         union all
    select '4000',              'São Paulo',                'LATAM'
)

select
    p.plant_id,
    coalesce(l.plant_name, concat('Plant ', p.plant_id)) as plant_name,
    coalesce(l.region, 'OTHER')                          as region
from plants p
left join labels l on p.plant_id = l.plant_id
