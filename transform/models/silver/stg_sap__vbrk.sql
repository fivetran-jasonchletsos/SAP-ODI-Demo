{{ config(materialized='view') }}

with source as (
    select *
    from {{ source('bronze_sap_sd', 'vbrk') }}
    where coalesce(_fivetran_deleted, false) = false
),

renamed as (
    select
        trim(vbeln)                              as billing_doc_id,
        trim(fkart)                              as billing_type,
        cast(fkdat as date)                      as billing_date,
        trim(kunrg)                              as payer_id,
        cast(netwr as double)                    as net_value_header,
        trim(waerk)                              as currency,
        _fivetran_synced                         as loaded_at
    from source
)

select * from renamed
