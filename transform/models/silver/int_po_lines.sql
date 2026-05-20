{{ config(materialized='view') }}

with header as (
    select * from {{ ref('stg_sap__ekko') }}
),

lines as (
    select * from {{ ref('stg_sap__ekpo') }}
),

invoiced as (
    select
        purchase_order_id,
        po_line_item                             as line_item,
        sum(invoiced_quantity)                   as invoiced_quantity,
        sum(invoiced_amount)                     as invoiced_amount
    from {{ ref('stg_sap__rseg') }}
    group by 1, 2
)

select
    h.purchase_order_id,
    l.line_item,
    h.company_code,
    h.po_date,
    cast(year(h.po_date) as integer)             as po_year,
    cast(quarter(h.po_date) as integer)          as po_quarter,
    h.vendor_id,
    l.material_id,
    l.po_quantity,
    l.unit_of_measure,
    l.net_price,
    cast(l.po_quantity as double) * cast(l.net_price as double) as po_line_value,
    l.plant_id,
    coalesce(i.invoiced_quantity, 0.0)           as invoiced_quantity,
    coalesce(i.invoiced_amount, 0.0)             as invoiced_amount,
    case
        when coalesce(i.invoiced_quantity, 0.0) = 0.0 then 'open'
        when i.invoiced_quantity < l.po_quantity      then 'partial'
        else 'closed'
    end                                          as po_line_status,
    h.currency,
    h.loaded_at
from header h
inner join lines l
    on h.purchase_order_id = l.purchase_order_id
left join invoiced i
    on  l.purchase_order_id = i.purchase_order_id
    and l.line_item         = i.line_item
