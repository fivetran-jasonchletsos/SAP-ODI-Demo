{{ config(
    materialized='table',
    table_type='iceberg',
    format='parquet'
) }}

with codes as (
    select distinct company_code
    from {{ ref('stg_sap__bkpf') }}
),

labels as (
    select 'KS01' as company_code, 'Keystone Industries NA' as company_name, 'USD' as functional_currency, 'United States' as country  union all
    select 'KS02',                 'Keystone Industries EMEA',                 'EUR',                    'Germany'         union all
    select 'KS03',                 'Keystone Industries APAC',                 'JPY',                    'Japan'           union all
    select 'KS04',                 'Keystone Industries LATAM',                'BRL',                    'Brazil'
)

select
    c.company_code,
    coalesce(l.company_name, concat('Company ', c.company_code))  as company_name,
    coalesce(l.functional_currency, 'USD')                        as functional_currency,
    coalesce(l.country, 'United States')                          as country
from codes c
left join labels l on c.company_code = l.company_code
