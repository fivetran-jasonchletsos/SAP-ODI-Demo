{{ config(materialized='view') }}

with source as (
    select *
    from {{ source('bronze_sap_sd', 'vbap') }}
    where coalesce(_fivetran_deleted, false) = false
),

renamed as (
    select
        trim(vbeln)                              as sales_doc_id,
        cast(posnr as integer)                   as line_item,
        trim(matnr)                              as material_id,
        cast(kwmeng as double)                   as order_quantity,
        trim(vrkme)                              as sales_unit,
        cast(netwr as double)                    as net_value_line,
        trim(werks)                              as plant_id,
        _fivetran_synced                         as loaded_at
    from source
)

select * from renamed
