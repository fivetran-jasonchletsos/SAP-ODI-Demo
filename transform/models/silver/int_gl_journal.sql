{{ config(materialized='view') }}

with header as (
    select * from {{ ref('stg_sap__bkpf') }}
),

lines as (
    select * from {{ ref('stg_sap__bseg') }}
)

select
    h.company_code,
    h.document_number,
    h.fiscal_year,
    l.line_item,
    h.document_type,
    h.document_date,
    h.posting_date,
    cast(year(h.posting_date) as integer)            as posting_year,
    cast(quarter(h.posting_date) as integer)         as posting_quarter,
    cast(month(h.posting_date) as integer)           as posting_month,
    l.gl_account,
    l.debit_credit_indicator,
    l.local_amount,
    l.signed_local_amount,
    l.document_amount,
    h.currency,
    l.customer_id,
    l.vendor_id,
    l.material_id,
    h.posted_by,
    h.loaded_at
from header h
inner join lines l
    on  h.company_code  = l.company_code
    and h.document_number = l.document_number
    and h.fiscal_year   = l.fiscal_year
