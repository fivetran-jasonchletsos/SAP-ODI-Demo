{{ config(materialized='view') }}

with source as (
    select *
    from {{ source('bronze_sap_sd', 'kna1') }}
),

renamed as (
    select
        trim(kunnr)                              as customer_id,
        trim(name1)                              as customer_name,
        trim(land1)                              as country,
        trim(ort01)                              as city,
        trim(regio)                              as region,
        _fivetran_synced                         as loaded_at
    from source
)

select * from renamed
