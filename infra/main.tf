# ============================================
# SAP-ODI-Demo — AWS infrastructure for Keystone
# Iceberg-on-S3 lake + Glue Catalog + Athena.
# No SAP-managed analytical surface in the path.
# ============================================

provider "aws" {
    region = var.aws_region

    default_tags {
        tags = var.tags
    }
}

resource "random_id" "suffix" {
    byte_length = 4
}

locals {
    suffix      = var.suffix != "" ? var.suffix : random_id.suffix.hex
    lake_bucket = "keystone-sap-odi-lake-${local.suffix}"
}

# --------------------------------------------
# S3 — the lake
# --------------------------------------------
resource "aws_s3_bucket" "lake" {
    bucket = local.lake_bucket

    tags = merge(var.tags, {
        Name = local.lake_bucket
        Role = "data-lake"
    })
}

resource "aws_s3_bucket_versioning" "lake" {
    bucket = aws_s3_bucket.lake.id
    versioning_configuration {
        status = "Enabled"
    }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "lake" {
    bucket = aws_s3_bucket.lake.id

    rule {
        apply_server_side_encryption_by_default {
            sse_algorithm = "AES256"
        }
    }
}

resource "aws_s3_bucket_public_access_block" "lake" {
    bucket = aws_s3_bucket.lake.id

    block_public_acls       = true
    block_public_policy     = true
    ignore_public_acls      = true
    restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "lake" {
    bucket = aws_s3_bucket.lake.id

    rule {
        id     = "transition-to-ia"
        status = "Enabled"
        filter {}
        transition {
            days          = 60
            storage_class = "STANDARD_IA"
        }
    }
}

resource "aws_s3_bucket_cors_configuration" "lake" {
    bucket = aws_s3_bucket.lake.id

    cors_rule {
        allowed_methods = ["GET"]
        allowed_origins = [var.github_pages_origin]
        allowed_headers = ["*"]
        expose_headers  = ["ETag"]
        max_age_seconds = 3000
    }
}

# --------------------------------------------
# Glue Data Catalog — top-level + four bronze SAP module schemas
# + silver/gold medallion DBs.
# --------------------------------------------
resource "aws_glue_catalog_database" "keystone_odi" {
    name        = "keystone_odi"
    description = "Top-level Glue database for the Keystone SAP ODI demo."
    tags        = var.tags
}

resource "aws_glue_catalog_database" "bronze_sap_fi" {
    name        = "bronze_sap_fi"
    description = "Bronze: SAP FI (Financial Accounting) raw tables from Fivetran SLT."
    tags        = var.tags
}

resource "aws_glue_catalog_database" "bronze_sap_sd" {
    name        = "bronze_sap_sd"
    description = "Bronze: SAP SD (Sales & Distribution) raw tables from Fivetran SLT."
    tags        = var.tags
}

resource "aws_glue_catalog_database" "bronze_sap_mm" {
    name        = "bronze_sap_mm"
    description = "Bronze: SAP MM (Materials Management) raw tables from Fivetran SLT."
    tags        = var.tags
}

resource "aws_glue_catalog_database" "bronze_sap_mat" {
    name        = "bronze_sap_mat"
    description = "Bronze: SAP material master (MARA, MARC, MBEW) from Fivetran SLT."
    tags        = var.tags
}

resource "aws_glue_catalog_database" "silver" {
    name        = "silver"
    description = "Silver: dbt-decoded SAP tables — business English column names."
    tags        = var.tags
}

resource "aws_glue_catalog_database" "gold" {
    name        = "gold"
    description = "Gold: dbt-built facts, dims, and marts for finance, O2C, P2P, inventory."
    tags        = var.tags
}

# --------------------------------------------
# Athena workgroup
# --------------------------------------------
resource "aws_athena_workgroup" "keystone_odi" {
    name = "keystone_odi"

    configuration {
        enforce_workgroup_configuration    = true
        publish_cloudwatch_metrics_enabled = true

        engine_version {
            selected_engine_version = "Athena engine version 3"
        }

        result_configuration {
            output_location = "s3://${aws_s3_bucket.lake.bucket}/athena-results/"

            encryption_configuration {
                encryption_option = "SSE_S3"
            }
        }
    }

    tags = var.tags
}
