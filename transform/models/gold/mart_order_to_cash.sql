{{ config(
    materialized='table',
    table_type='iceberg',
    format='parquet'
) }}

select
    sales_doc_id,
    customer_id,
    created_date,
    first_billing_date,
    days_to_first_bill,
    sum(order_value)                              as total_order_value,
    sum(billed_value)                             as total_billed_value,
    max(order_status)                             as order_status,
    case
        when days_to_first_bill is null              then 'unbilled'
        when days_to_first_bill <= 14                then 'fast'
        when days_to_first_bill <= 30                then 'normal'
        when days_to_first_bill <= 60                then 'slow'
        else                                              'very_slow'
    end                                           as o2c_band
from {{ ref('fct_sales_orders') }}
group by 1, 2, 3, 4, 5
