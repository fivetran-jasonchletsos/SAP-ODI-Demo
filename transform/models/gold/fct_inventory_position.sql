{{ config(
    materialized='table',
    table_type='iceberg',
    format='parquet'
) }}

with marc as (
    select * from {{ ref('stg_sap__marc') }}
),

mbew as (
    select material_id, valuation_area as plant_id, standard_price, currency
    from {{ ref('stg_sap__mbew') }}
),

mara as (
    select material_id, material_type, material_group, base_unit_of_measure
    from {{ ref('stg_sap__mara') }}
),

stock_synthetic as (
    select
        m.material_id,
        m.plant_id,
        cast(50 + (abs(from_base(substr(md5(concat(m.material_id, m.plant_id)), 1, 4), 16)) % 950) as double) as on_hand_quantity
    from marc m
)

select
    {{ dbt_utils.generate_surrogate_key(['s.material_id','s.plant_id']) }} as inventory_key,
    s.material_id,
    a.material_type,
    a.material_group,
    a.base_unit_of_measure,
    s.plant_id,
    s.on_hand_quantity,
    coalesce(v.standard_price, 0.0)                                          as standard_price,
    s.on_hand_quantity * coalesce(v.standard_price, 0.0)                     as inventory_value,
    coalesce(v.currency, 'USD')                                              as currency,
    current_timestamp                                                        as snapshot_at
from stock_synthetic s
left join mara a on s.material_id = a.material_id
left join mbew v on s.material_id = v.material_id and s.plant_id = v.plant_id
