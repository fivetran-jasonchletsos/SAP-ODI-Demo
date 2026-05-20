{{ config(materialized='view') }}

with header as (
    select * from {{ ref('stg_sap__vbrk') }}
),

lines as (
    select * from {{ ref('stg_sap__vbrp') }}
)

select
    h.billing_doc_id,
    l.line_item,
    h.billing_type,
    h.billing_date,
    cast(year(h.billing_date) as integer)        as billing_year,
    cast(quarter(h.billing_date) as integer)     as billing_quarter,
    cast(month(h.billing_date) as integer)       as billing_month,
    h.payer_id,
    l.material_id,
    l.billed_quantity,
    l.net_value_line,
    l.source_sales_doc_id,
    h.currency,
    h.loaded_at
from header h
inner join lines l
    on h.billing_doc_id = l.billing_doc_id
