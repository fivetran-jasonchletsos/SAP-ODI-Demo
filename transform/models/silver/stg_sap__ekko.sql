{{ config(materialized='view') }}

with source as (
    select *
    from {{ source('bronze_sap_mm', 'ekko') }}
    where coalesce(_fivetran_deleted, false) = false
),

renamed as (
    select
        trim(ebeln)                              as purchase_order_id,
        trim(bukrs)                              as company_code,
        cast(bedat as date)                      as po_date,
        trim(lifnr)                              as vendor_id,
        trim(waers)                              as currency,
        _fivetran_synced                         as loaded_at
    from source
)

select * from renamed
