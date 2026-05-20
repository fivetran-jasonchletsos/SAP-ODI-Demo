{{ config(
    materialized='table',
    table_type='iceberg',
    format='parquet',
    partitioned_by=['year(posting_date)', 'company_code']
) }}

with j as (
    select * from {{ ref('int_gl_journal') }}
),

acct as (
    select * from {{ ref('dim_gl_account') }}
)

select
    {{ dbt_utils.generate_surrogate_key(['j.company_code','j.document_number','j.fiscal_year','j.line_item']) }} as journal_key,
    j.company_code,
    j.document_number,
    j.fiscal_year,
    j.line_item,
    j.document_type,
    j.document_date,
    j.posting_date,
    j.posting_year,
    j.posting_quarter,
    j.posting_month,
    j.gl_account,
    coalesce(a.gl_account_description, 'Unknown') as gl_account_description,
    coalesce(a.account_class, 'other')            as account_class,
    j.debit_credit_indicator,
    j.local_amount,
    j.signed_local_amount,
    j.document_amount,
    j.currency,
    j.customer_id,
    j.vendor_id,
    j.material_id,
    j.posted_by,
    j.loaded_at
from j
left join acct a
    on j.company_code = a.company_code
   and j.gl_account   = a.gl_account
