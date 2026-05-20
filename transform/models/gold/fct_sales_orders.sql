{{ config(
    materialized='table',
    table_type='iceberg',
    format='parquet',
    partitioned_by=['year(created_date)']
) }}

with so as (
    select * from {{ ref('int_sales_order_lines') }}
),

billed as (
    select
        source_sales_doc_id                      as sales_doc_id,
        sum(billed_quantity)                     as billed_quantity,
        sum(net_value_line)                      as billed_value,
        min(billing_date)                        as first_billing_date
    from {{ ref('int_billing_lines') }}
    where source_sales_doc_id is not null
    group by 1
)

select
    {{ dbt_utils.generate_surrogate_key(['so.sales_doc_id','so.line_item']) }} as sales_order_key,
    so.sales_doc_id,
    so.line_item,
    so.created_date,
    so.created_year,
    so.created_quarter,
    so.sales_doc_type,
    so.customer_id,
    so.sales_organization,
    so.material_id,
    so.order_quantity,
    so.sales_unit,
    so.net_value_line                            as order_value,
    so.plant_id,
    so.currency,
    coalesce(b.billed_quantity, 0.0)             as billed_quantity,
    coalesce(b.billed_value, 0.0)                as billed_value,
    case
        when coalesce(b.billed_quantity, 0.0) = 0.0 then 'open'
        when b.billed_quantity < so.order_quantity then 'partial'
        else 'closed'
    end                                          as order_status,
    b.first_billing_date,
    case
        when b.first_billing_date is not null
        then date_diff('day', so.created_date, b.first_billing_date)
    end                                          as days_to_first_bill,
    so.loaded_at
from so
left join billed b on so.sales_doc_id = b.sales_doc_id
