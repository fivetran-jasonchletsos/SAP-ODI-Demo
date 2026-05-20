{{ config(
    materialized='table',
    table_type='iceberg',
    format='parquet'
) }}

with po as (
    select
        vendor_id,
        count(*)                                  as po_line_count,
        sum(po_line_value)                        as total_po_value,
        sum(invoiced_amount)                      as total_invoiced,
        sum(case when po_line_status = 'closed'  then 1 else 0 end) as closed_lines,
        sum(case when po_line_status = 'open'    then 1 else 0 end) as open_lines,
        sum(case when po_line_status = 'partial' then 1 else 0 end) as partial_lines
    from {{ ref('fct_purchase_orders') }}
    where vendor_id is not null
    group by 1
),

v as (
    select * from {{ ref('dim_vendor') }}
)

select
    p.vendor_id,
    v.vendor_name,
    v.region_bucket,
    p.po_line_count,
    p.total_po_value,
    p.total_invoiced,
    p.closed_lines,
    p.open_lines,
    p.partial_lines,
    case when p.po_line_count = 0 then 0.0
         else 100.0 * p.closed_lines / p.po_line_count
    end                                           as three_way_match_pct,
    case
        when p.po_line_count >= 50 and 100.0 * p.closed_lines / p.po_line_count >= 95.0 then 'A'
        when 100.0 * p.closed_lines / p.po_line_count >= 90.0 then 'B'
        when 100.0 * p.closed_lines / p.po_line_count >= 80.0 then 'C'
        else 'D'
    end                                           as supplier_grade
from po p
left join v on p.vendor_id = v.vendor_id
