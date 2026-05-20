{{ config(materialized='view') }}

with source as (
    select *
    from {{ source('bronze_sap_fi', 'skb1') }}
),

renamed as (
    select
        trim(bukrs)                              as company_code,
        trim(saknr)                              as gl_account,
        trim(mwskz)                              as tax_code,
        case when trim(xopvw) = 'X' then true else false end
                                                 as open_item_managed,
        _fivetran_synced                         as loaded_at
    from source
)

select * from renamed
