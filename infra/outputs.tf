output "lake_bucket" {
    description = "S3 bucket that holds bronze/silver/gold Iceberg tables."
    value       = aws_s3_bucket.lake.bucket
}

output "athena_workgroup" {
    description = "Athena workgroup name to set in dbt profiles.yml."
    value       = aws_athena_workgroup.keystone_odi.name
}

output "fivetran_role_arn" {
    description = "Role ARN to paste into the Fivetran SAP destination setup."
    value       = aws_iam_role.fivetran.arn
}

output "dbt_role_arn" {
    description = "Role ARN the dbt runner assumes."
    value       = aws_iam_role.dbt.arn
}

output "glue_databases" {
    description = "All Glue databases this stack creates."
    value = [
        aws_glue_catalog_database.keystone_odi.name,
        aws_glue_catalog_database.bronze_sap_fi.name,
        aws_glue_catalog_database.bronze_sap_sd.name,
        aws_glue_catalog_database.bronze_sap_mm.name,
        aws_glue_catalog_database.bronze_sap_mat.name,
        aws_glue_catalog_database.silver.name,
        aws_glue_catalog_database.gold.name,
    ]
}
