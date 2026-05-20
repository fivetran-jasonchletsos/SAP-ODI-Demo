{{ config(materialized='view') }}

with source as (
    select *
    from {{ source('bronze_sap_fi', 'bkpf') }}
    where coalesce(_fivetran_deleted, false) = false
),

renamed as (
    select
        trim(bukrs)                              as company_code,
        trim(belnr)                              as document_number,
        cast(gjahr as integer)                   as fiscal_year,
        trim(blart)                              as document_type,
        cast(bldat as date)                      as document_date,
        cast(budat as date)                      as posting_date,
        trim(waers)                              as currency,
        trim(usnam)                              as posted_by,
        _fivetran_synced                         as loaded_at
    from source
)

select * from renamed
