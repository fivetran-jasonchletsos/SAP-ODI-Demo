{{ config(
    materialized='table',
    table_type='iceberg',
    format='parquet'
) }}

with mara as (
    select * from {{ ref('stg_sap__mara') }}
),

mbew as (
    select
        material_id,
        avg(standard_price)                       as avg_standard_price,
        any_value(currency)                       as currency
    from {{ ref('stg_sap__mbew') }}
    group by material_id
)

select
    m.material_id,
    m.material_type,
    m.material_group,
    m.base_unit_of_measure,
    coalesce(p.avg_standard_price, 0.0)           as standard_price,
    coalesce(p.currency, 'USD')                   as currency,
    m.loaded_at
from mara m
left join mbew p on m.material_id = p.material_id
