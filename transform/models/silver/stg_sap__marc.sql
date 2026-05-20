{{ config(materialized='view') }}

with source as (
    select *
    from {{ source('bronze_sap_mat', 'marc') }}
),

renamed as (
    select
        trim(matnr)                              as material_id,
        trim(werks)                              as plant_id,
        trim(dispo)                              as mrp_controller,
        trim(ekgrp)                              as purchasing_group,
        _fivetran_synced                         as loaded_at
    from source
)

select * from renamed
