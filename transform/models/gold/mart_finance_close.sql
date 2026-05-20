{{ config(
    materialized='table',
    table_type='iceberg',
    format='parquet'
) }}

with j as (
    select * from {{ ref('fct_gl_journal') }}
),

daily as (
    select
        company_code,
        posting_year,
        posting_month,
        posting_date,
        count(*)                              as posting_count,
        sum(abs(signed_local_amount))         as gross_postings
    from j
    group by 1,2,3,4
),

ranked as (
    select
        d.*,
        day(posting_date)                     as day_of_month,
        sum(posting_count) over (
            partition by company_code, posting_year, posting_month
            order by posting_date
        )                                     as cumulative_postings,
        sum(posting_count) over (
            partition by company_code, posting_year, posting_month
        )                                     as total_postings_in_month
    from daily d
)

select
    company_code,
    posting_year,
    posting_month,
    posting_date,
    day_of_month,
    posting_count,
    gross_postings,
    cumulative_postings,
    total_postings_in_month,
    case
        when total_postings_in_month = 0 then 0.0
        else 100.0 * cumulative_postings / total_postings_in_month
    end                                       as pct_complete
from ranked
