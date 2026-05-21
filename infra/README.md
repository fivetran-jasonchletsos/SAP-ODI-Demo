# Terraform — Keystone SAP ODI lake

Provisions everything AWS-side the Fivetran SAP connector and the dbt
project need:

- One S3 bucket — the lake — versioned, encrypted, lifecycle to IA.
- Seven Glue catalog databases — `keystone_odi`, four bronze SAP schemas, silver, gold.
- Athena workgroup `keystone_odi` (engine v3, SSE_S3).
- Two IAM roles — one Fivetran assumes (gated by external ID), one the dbt runner assumes.

## Apply

```bash
cp terraform.tfvars.example terraform.tfvars
# Fill in fivetran_external_id (from the Fivetran SAP destination setup)
# and dbt_iam_user_arn.

terraform init
terraform plan
terraform apply
```

Expected monthly spend at demo volume: $5–15.

## After apply

```bash
terraform output -raw lake_bucket
terraform output -raw athena_workgroup
terraform output -raw fivetran_role_arn
terraform output -raw dbt_role_arn
```

Paste `fivetran_role_arn` into the Fivetran SAP destination. Use
`dbt_role_arn` + `lake_bucket` + `athena_workgroup` in the dbt
`profiles.yml`.

## What this stack does NOT include

- Snowflake. ODI's whole point is the lake itself; Snowflake (or BigQuery)
  is an optional engine, not a path through the architecture.
- Any SAP-managed analytical product. The Fivetran connector lands raw
  SAP tables here and does not require SAP BW, Datasphere, or the SAP
  Datasphere catalog.
- ODP RFC interfaces. By design — see the policy brief at `/policy`.
