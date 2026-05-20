{{ config(
    materialized='table',
    table_type='iceberg',
    format='parquet',
    partitioned_by=['year(po_date)']
) }}

select
    {{ dbt_utils.generate_surrogate_key(['purchase_order_id','line_item']) }} as po_key,
    purchase_order_id,
    line_item,
    company_code,
    po_date,
    po_year,
    po_quarter,
    vendor_id,
    material_id,
    po_quantity,
    unit_of_measure,
    net_price,
    po_line_value,
    plant_id,
    invoiced_quantity,
    invoiced_amount,
    po_line_status,
    case
        when po_line_status = 'closed' then 1
        else 0
    end                                          as three_way_match_complete,
    currency,
    loaded_at
from {{ ref('int_po_lines') }}
