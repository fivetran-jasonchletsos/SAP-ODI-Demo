{{ config(materialized='view') }}

with source as (
    select *
    from {{ source('bronze_sap_fi', 'bseg') }}
    where coalesce(_fivetran_deleted, false) = false
),

renamed as (
    select
        trim(bukrs)                              as company_code,
        trim(belnr)                              as document_number,
        cast(gjahr as integer)                   as fiscal_year,
        cast(buzei as integer)                   as line_item,
        trim(hkont)                              as gl_account,
        cast(dmbtr as double)                    as local_amount,
        cast(wrbtr as double)                    as document_amount,
        trim(shkzg)                              as debit_credit_indicator,
        case when trim(shkzg) = 'H' then -1.0 else 1.0 end
            * cast(dmbtr as double)              as signed_local_amount,
        trim(kunnr)                              as customer_id,
        trim(lifnr)                              as vendor_id,
        trim(matnr)                              as material_id,
        _fivetran_synced                         as loaded_at
    from source
)

select * from renamed
