{{ config(
    materialized='table',
    table_type='iceberg',
    format='parquet'
) }}

with stock as (
    select
        material_id,
        plant_id,
        on_hand_quantity,
        standard_price,
        inventory_value
    from {{ ref('fct_inventory_position') }}
),

cogs_proxy as (
    select
        material_id,
        sum(invoice_amount)                       as ttm_cogs_proxy
    from {{ ref('fct_invoices') }}
    where billing_date >= date_add('day', -365, current_date)
    group by 1
),

mara as (
    select material_id, material_type, material_group, base_unit_of_measure
    from {{ ref('stg_sap__mara') }}
)

select
    s.material_id,
    a.material_type,
    a.material_group,
    s.plant_id,
    s.on_hand_quantity,
    s.standard_price,
    s.inventory_value,
    coalesce(c.ttm_cogs_proxy, 0.0)               as ttm_cogs_proxy,
    case
        when s.inventory_value = 0.0 then null
        else coalesce(c.ttm_cogs_proxy, 0.0) / s.inventory_value
    end                                           as turns,
    case
        when coalesce(c.ttm_cogs_proxy, 0.0) = 0.0 then 'no_movement'
        when (c.ttm_cogs_proxy / nullif(s.inventory_value, 0)) < 1.0 then 'slow'
        when (c.ttm_cogs_proxy / nullif(s.inventory_value, 0)) < 4.0 then 'normal'
        else 'fast'
    end                                           as turn_band
from stock s
left join mara a on s.material_id = a.material_id
left join cogs_proxy c on s.material_id = c.material_id
