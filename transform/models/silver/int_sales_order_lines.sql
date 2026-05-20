{{ config(materialized='view') }}

with header as (
    select * from {{ ref('stg_sap__vbak') }}
),

lines as (
    select * from {{ ref('stg_sap__vbap') }}
)

select
    h.sales_doc_id,
    l.line_item,
    h.created_date,
    cast(year(h.created_date) as integer)        as created_year,
    cast(quarter(h.created_date) as integer)     as created_quarter,
    h.sales_doc_type,
    h.customer_id,
    h.sales_organization,
    l.material_id,
    l.order_quantity,
    l.sales_unit,
    l.net_value_line,
    l.plant_id,
    h.currency,
    h.loaded_at
from header h
inner join lines l
    on h.sales_doc_id = l.sales_doc_id
