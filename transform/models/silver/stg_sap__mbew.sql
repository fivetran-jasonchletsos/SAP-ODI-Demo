{{ config(materialized='view') }}

with source as (
    select *
    from {{ source('bronze_sap_mat', 'mbew') }}
),

renamed as (
    select
        trim(matnr)                              as material_id,
        trim(bwkey)                              as valuation_area,
        cast(stprs as double)                    as standard_price,
        cast(peinh as double)                    as price_unit,
        trim(waers)                              as currency,
        _fivetran_synced                         as loaded_at
    from source
)

select * from renamed
