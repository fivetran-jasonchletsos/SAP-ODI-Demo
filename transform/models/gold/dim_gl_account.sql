{{ config(
    materialized='table',
    table_type='iceberg',
    format='parquet'
) }}

with skb1 as (
    select * from {{ ref('stg_sap__skb1') }}
),

skat as (
    select * from {{ ref('stg_sap__skat') }}
)

select
    b.company_code,
    b.gl_account,
    t.gl_account_description,
    case
        when substr(b.gl_account, 1, 1) = '1' then 'asset'
        when substr(b.gl_account, 1, 1) = '2' then 'liability'
        when substr(b.gl_account, 1, 1) = '3' then 'equity'
        when substr(b.gl_account, 1, 1) = '4' then 'revenue'
        when substr(b.gl_account, 1, 1) in ('5','6','7') then 'expense'
        else 'other'
    end                                            as account_class,
    case
        when substr(b.gl_account, 1, 1) in ('1','5','6','7') then 'debit'
        else 'credit'
    end                                            as normal_balance,
    b.tax_code,
    b.open_item_managed
from skb1 b
left join skat t on b.gl_account = t.gl_account
