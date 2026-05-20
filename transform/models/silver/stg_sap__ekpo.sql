{{ config(materialized='view') }}

with source as (
    select *
    from {{ source('bronze_sap_mm', 'ekpo') }}
    where coalesce(_fivetran_deleted, false) = false
),

renamed as (
    select
        trim(ebeln)                              as purchase_order_id,
        cast(ebelp as integer)                   as line_item,
        trim(matnr)                              as material_id,
        cast(menge as double)                    as po_quantity,
        trim(meins)                              as unit_of_measure,
        cast(netpr as double)                    as net_price,
        trim(werks)                              as plant_id,
        _fivetran_synced                         as loaded_at
    from source
)

select * from renamed
