{{ config(materialized='view') }}

with source as (
    select *
    from {{ source('bronze_sap_mm', 'lfa1') }}
),

renamed as (
    select
        trim(lifnr)                              as vendor_id,
        trim(name1)                              as vendor_name,
        trim(land1)                              as country,
        trim(ort01)                              as city,
        _fivetran_synced                         as loaded_at
    from source
)

select * from renamed
