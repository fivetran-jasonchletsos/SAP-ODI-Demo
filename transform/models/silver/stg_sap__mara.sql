{{ config(materialized='view') }}

with source as (
    select *
    from {{ source('bronze_sap_mat', 'mara') }}
),

renamed as (
    select
        trim(matnr)                              as material_id,
        trim(mtart)                              as material_type,
        trim(matkl)                              as material_group,
        trim(meins)                              as base_unit_of_measure,
        _fivetran_synced                         as loaded_at
    from source
)

select * from renamed
