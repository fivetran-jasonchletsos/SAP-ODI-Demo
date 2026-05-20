{{ config(
    materialized='table',
    table_type='iceberg',
    format='parquet'
) }}

with j as (
    select * from {{ ref('fct_gl_journal') }}
)

select
    company_code,
    posting_year,
    posting_quarter,
    gl_account,
    gl_account_description,
    account_class,
    sum(case when signed_local_amount >= 0 then signed_local_amount else 0 end) as debit_total,
    sum(case when signed_local_amount <  0 then -signed_local_amount else 0 end) as credit_total,
    sum(signed_local_amount)                                                     as net_balance,
    count(*)                                                                     as posting_count
from j
group by 1,2,3,4,5,6
