{{ config(
    materialized='table',
    table_type='iceberg',
    format='parquet'
) }}

with cogs as (
    select
        vendor_id,
        cast(year(po_date) as integer)            as period_year,
        cast(month(po_date) as integer)           as period_month,
        sum(invoiced_amount)                      as monthly_spend
    from {{ ref('fct_supplier_invoices') }}
    where vendor_id is not null
    group by 1, 2, 3
),

ap as (
    select
        vendor_id,
        posting_year                              as period_year,
        posting_month                             as period_month,
        sum(signed_local_amount)                  as ap_balance
    from {{ ref('fct_gl_journal') }}
    where account_class = 'liability'
      and vendor_id is not null
      and vendor_id != ''
    group by 1, 2, 3
)

select
    coalesce(cogs.vendor_id, ap.vendor_id)        as vendor_id,
    coalesce(cogs.period_year, ap.period_year)    as period_year,
    coalesce(cogs.period_month, ap.period_month)  as period_month,
    coalesce(cogs.monthly_spend, 0.0)             as monthly_spend,
    coalesce(ap.ap_balance, 0.0)                  as ap_balance,
    case
        when coalesce(cogs.monthly_spend, 0.0) = 0.0 then null
        else (abs(ap.ap_balance) / cogs.monthly_spend) * 30.0
    end                                           as dpo_days
from cogs
full outer join ap
    on  cogs.vendor_id    = ap.vendor_id
    and cogs.period_year  = ap.period_year
    and cogs.period_month = ap.period_month
