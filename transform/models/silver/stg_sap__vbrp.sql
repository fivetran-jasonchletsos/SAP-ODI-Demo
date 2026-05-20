{{ config(materialized='view') }}

with source as (
    select *
    from {{ source('bronze_sap_sd', 'vbrp') }}
    where coalesce(_fivetran_deleted, false) = false
),

renamed as (
    select
        trim(vbeln)                              as billing_doc_id,
        cast(posnr as integer)                   as line_item,
        trim(matnr)                              as material_id,
        cast(fkimg as double)                    as billed_quantity,
        cast(netwr as double)                    as net_value_line,
        trim(aubel)                              as source_sales_doc_id,
        _fivetran_synced                         as loaded_at
    from source
)

select * from renamed
