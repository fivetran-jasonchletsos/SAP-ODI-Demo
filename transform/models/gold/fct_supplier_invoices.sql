{{ config(
    materialized='table',
    table_type='iceberg',
    format='parquet'
) }}

with r as (
    select * from {{ ref('stg_sap__rseg') }}
),

po as (
    select purchase_order_id, vendor_id, po_date
    from {{ ref('stg_sap__ekko') }}
)

select
    {{ dbt_utils.generate_surrogate_key(['r.invoice_doc_id','r.fiscal_year','r.line_item']) }} as supplier_invoice_key,
    r.invoice_doc_id,
    r.fiscal_year,
    r.line_item,
    r.purchase_order_id,
    r.po_line_item,
    po.vendor_id,
    po.po_date,
    r.material_id,
    r.invoiced_quantity,
    r.invoiced_amount,
    r.loaded_at
from r
left join po on r.purchase_order_id = po.purchase_order_id
