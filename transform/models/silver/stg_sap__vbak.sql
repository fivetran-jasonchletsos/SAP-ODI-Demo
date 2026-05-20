{{ config(materialized='view') }}

with source as (
    select *
    from {{ source('bronze_sap_sd', 'vbak') }}
    where coalesce(_fivetran_deleted, false) = false
),

renamed as (
    select
        trim(vbeln)                              as sales_doc_id,
        cast(erdat as date)                      as created_date,
        trim(auart)                              as sales_doc_type,
        trim(kunnr)                              as customer_id,
        trim(vkorg)                              as sales_organization,
        cast(netwr as double)                    as net_value_header,
        trim(waerk)                              as currency,
        _fivetran_synced                         as loaded_at
    from source
)

select * from renamed
