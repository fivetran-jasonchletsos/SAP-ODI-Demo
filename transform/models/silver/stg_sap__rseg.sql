{{ config(materialized='view') }}

with source as (
    select *
    from {{ source('bronze_sap_mm', 'rseg') }}
    where coalesce(_fivetran_deleted, false) = false
),

renamed as (
    select
        trim(belnr)                              as invoice_doc_id,
        cast(gjahr as integer)                   as fiscal_year,
        cast(buzei as integer)                   as line_item,
        trim(ebeln)                              as purchase_order_id,
        cast(ebelp as integer)                   as po_line_item,
        trim(matnr)                              as material_id,
        cast(menge as double)                    as invoiced_quantity,
        cast(wrbtr as double)                    as invoiced_amount,
        _fivetran_synced                         as loaded_at
    from source
)

select * from renamed
