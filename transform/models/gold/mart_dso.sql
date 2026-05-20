{{ config(
    materialized='table',
    table_type='iceberg',
    format='parquet'
) }}

with inv as (
    select
        customer_id,
        billing_year,
        billing_month,
        sum(invoice_amount)                       as monthly_revenue
    from {{ ref('fct_invoices') }}
    group by 1, 2, 3
),

ar as (
    select
        customer_id,
        posting_year,
        posting_month,
        sum(signed_local_amount)                  as ar_balance
    from {{ ref('fct_gl_journal') }}
    where account_class = 'asset'
      and customer_id is not null
      and customer_id != ''
    group by 1, 2, 3
)

select
    coalesce(inv.customer_id, ar.customer_id)     as customer_id,
    coalesce(inv.billing_year, ar.posting_year)   as period_year,
    coalesce(inv.billing_month, ar.posting_month) as period_month,
    coalesce(inv.monthly_revenue, 0.0)            as monthly_revenue,
    coalesce(ar.ar_balance, 0.0)                  as ar_balance,
    case
        when coalesce(inv.monthly_revenue, 0.0) = 0.0 then null
        else (ar.ar_balance / inv.monthly_revenue) * 30.0
    end                                           as dso_days
from inv
full outer join ar
    on  inv.customer_id    = ar.customer_id
    and inv.billing_year   = ar.posting_year
    and inv.billing_month  = ar.posting_month
