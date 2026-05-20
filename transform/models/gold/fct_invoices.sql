{{ config(
    materialized='table',
    table_type='iceberg',
    format='parquet',
    partitioned_by=['year(billing_date)']
) }}

select
    {{ dbt_utils.generate_surrogate_key(['billing_doc_id','line_item']) }} as invoice_key,
    billing_doc_id,
    line_item,
    billing_type,
    billing_date,
    billing_year,
    billing_quarter,
    billing_month,
    payer_id                                     as customer_id,
    material_id,
    billed_quantity,
    net_value_line                               as invoice_amount,
    source_sales_doc_id,
    currency,
    loaded_at
from {{ ref('int_billing_lines') }}
