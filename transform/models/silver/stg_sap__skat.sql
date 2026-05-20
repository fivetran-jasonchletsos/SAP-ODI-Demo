{{ config(materialized='view') }}

with source as (
    select *
    from {{ source('bronze_sap_fi', 'skat') }}
),

renamed as (
    select
        trim(spras)                              as language_key,
        trim(ktopl)                              as chart_of_accounts,
        trim(saknr)                              as gl_account,
        trim(txt50)                              as gl_account_description,
        _fivetran_synced                         as loaded_at
    from source
    where trim(spras) = 'E'
)

select * from renamed
