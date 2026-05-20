# ============================================
# IAM — Fivetran SAP/SLT ingest role + dbt runner role
# ============================================

data "aws_caller_identity" "current" {}

# --------------------------------------------
# Fivetran ingest role (assumed by Fivetran AWS account, gated by external ID)
# --------------------------------------------
data "aws_iam_policy_document" "fivetran_trust" {
    statement {
        effect  = "Allow"
        actions = ["sts:AssumeRole"]

        principals {
            type        = "AWS"
            identifiers = ["arn:aws:iam::${var.fivetran_aws_account_id}:root"]
        }

        condition {
            test     = "StringEquals"
            variable = "sts:ExternalId"
            values   = [var.fivetran_external_id]
        }
    }
}

resource "aws_iam_role" "fivetran" {
    name               = "keystone-odi-fivetran"
    description        = "Fivetran assume-role for landing SAP data into the four bronze_sap_* schemas."
    assume_role_policy = data.aws_iam_policy_document.fivetran_trust.json

    tags = var.tags
}

data "aws_iam_policy_document" "fivetran_lake_access" {
    statement {
        sid    = "BucketLevel"
        effect = "Allow"
        actions = [
            "s3:ListBucket",
            "s3:GetBucketLocation",
            "s3:GetBucketVersioning",
        ]
        resources = [aws_s3_bucket.lake.arn]
    }

    statement {
        sid    = "BronzeObjectLevel"
        effect = "Allow"
        actions = [
            "s3:GetObject",
            "s3:GetObjectVersion",
            "s3:PutObject",
            "s3:DeleteObject",
            "s3:AbortMultipartUpload",
        ]
        resources = [
            "${aws_s3_bucket.lake.arn}/bronze_sap_fi/*",
            "${aws_s3_bucket.lake.arn}/bronze_sap_sd/*",
            "${aws_s3_bucket.lake.arn}/bronze_sap_mm/*",
            "${aws_s3_bucket.lake.arn}/bronze_sap_mat/*",
            "${aws_s3_bucket.lake.arn}/athena-results/*",
        ]
    }

    statement {
        sid    = "GlueCatalogBronze"
        effect = "Allow"
        actions = [
            "glue:GetDatabase",
            "glue:GetDatabases",
            "glue:CreateTable",
            "glue:UpdateTable",
            "glue:DeleteTable",
            "glue:GetTable",
            "glue:GetTables",
            "glue:GetPartition",
            "glue:GetPartitions",
            "glue:BatchCreatePartition",
            "glue:BatchDeletePartition",
            "glue:BatchUpdatePartition",
            "glue:CreatePartition",
            "glue:UpdatePartition",
            "glue:DeletePartition",
        ]
        resources = [
            "arn:aws:glue:${var.aws_region}:${data.aws_caller_identity.current.account_id}:catalog",
            aws_glue_catalog_database.bronze_sap_fi.arn,
            aws_glue_catalog_database.bronze_sap_sd.arn,
            aws_glue_catalog_database.bronze_sap_mm.arn,
            aws_glue_catalog_database.bronze_sap_mat.arn,
            "arn:aws:glue:${var.aws_region}:${data.aws_caller_identity.current.account_id}:table/bronze_sap_fi/*",
            "arn:aws:glue:${var.aws_region}:${data.aws_caller_identity.current.account_id}:table/bronze_sap_sd/*",
            "arn:aws:glue:${var.aws_region}:${data.aws_caller_identity.current.account_id}:table/bronze_sap_mm/*",
            "arn:aws:glue:${var.aws_region}:${data.aws_caller_identity.current.account_id}:table/bronze_sap_mat/*",
        ]
    }
}

resource "aws_iam_role_policy" "fivetran_lake_access" {
    name   = "keystone-odi-fivetran-lake-access"
    role   = aws_iam_role.fivetran.id
    policy = data.aws_iam_policy_document.fivetran_lake_access.json
}

# --------------------------------------------
# dbt runner role
# --------------------------------------------
data "aws_iam_policy_document" "dbt_trust" {
    statement {
        effect  = "Allow"
        actions = ["sts:AssumeRole"]

        principals {
            type        = "AWS"
            identifiers = [var.dbt_iam_user_arn]
        }
    }
}

resource "aws_iam_role" "dbt" {
    name               = "keystone-odi-dbt"
    description        = "dbt runner — reads bronze SAP, builds silver+gold, runs Athena."
    assume_role_policy = data.aws_iam_policy_document.dbt_trust.json

    tags = var.tags
}

data "aws_iam_policy_document" "dbt_lake_access" {
    statement {
        sid    = "BucketLevel"
        effect = "Allow"
        actions = ["s3:ListBucket", "s3:GetBucketLocation"]
        resources = [aws_s3_bucket.lake.arn]
    }

    statement {
        sid    = "BronzeRead"
        effect = "Allow"
        actions = ["s3:GetObject", "s3:GetObjectVersion"]
        resources = [
            "${aws_s3_bucket.lake.arn}/bronze_sap_fi/*",
            "${aws_s3_bucket.lake.arn}/bronze_sap_sd/*",
            "${aws_s3_bucket.lake.arn}/bronze_sap_mm/*",
            "${aws_s3_bucket.lake.arn}/bronze_sap_mat/*",
        ]
    }

    statement {
        sid    = "SilverGoldWrite"
        effect = "Allow"
        actions = [
            "s3:GetObject", "s3:GetObjectVersion",
            "s3:PutObject", "s3:DeleteObject",
            "s3:AbortMultipartUpload",
        ]
        resources = [
            "${aws_s3_bucket.lake.arn}/silver/*",
            "${aws_s3_bucket.lake.arn}/gold/*",
            "${aws_s3_bucket.lake.arn}/dbt/*",
            "${aws_s3_bucket.lake.arn}/athena-results/*",
        ]
    }

    statement {
        sid    = "AthenaWorkgroup"
        effect = "Allow"
        actions = [
            "athena:StartQueryExecution",
            "athena:StopQueryExecution",
            "athena:GetQueryExecution",
            "athena:GetQueryResults",
            "athena:GetQueryResultsStream",
            "athena:GetWorkGroup",
            "athena:ListQueryExecutions",
            "athena:BatchGetQueryExecution",
        ]
        resources = [aws_athena_workgroup.keystone_odi.arn]
    }

    statement {
        sid    = "GlueAll"
        effect = "Allow"
        actions = [
            "glue:GetDatabase",
            "glue:GetDatabases",
            "glue:CreateTable",
            "glue:UpdateTable",
            "glue:DeleteTable",
            "glue:GetTable",
            "glue:GetTables",
            "glue:GetPartition",
            "glue:GetPartitions",
            "glue:BatchCreatePartition",
            "glue:BatchDeletePartition",
            "glue:BatchUpdatePartition",
            "glue:CreatePartition",
            "glue:UpdatePartition",
            "glue:DeletePartition",
        ]
        resources = ["*"]
    }
}

resource "aws_iam_role_policy" "dbt_lake_access" {
    name   = "keystone-odi-dbt-lake-access"
    role   = aws_iam_role.dbt.id
    policy = data.aws_iam_policy_document.dbt_lake_access.json
}
