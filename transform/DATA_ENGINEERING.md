# Data engineering choices, mapped to Reis & Housley

This file documents the deliberate engineering decisions in the dbt
project, mapped to the framework in *Fundamentals of Data Engineering*
(Reis & Housley). Use this as the SE talking guide for the technical
deep-dive after the demo.

## The data engineering lifecycle (Ch. 2)

| Phase | Where it lives in this repo | Implementation notes |
|---|---|---|
| **Generation** | Live SAP S/4HANA at Keystone | Source of record is SAP's application tier. We do not modify it. |
| **Ingestion** | `connectors/` — Fivetran managed SAP connector (NetWeaver + triggers path) | Trigger-based CDC via Fivetran's own triggers in the `/FIVETRAN/` namespace, not ODP RFC (deprecating July 2026 per the policy brief). Sync cadence 15 min. |
| **Storage** | `infra/` — S3 + Apache Iceberg + AWS Glue catalog | Object storage decoupled from compute; columnar parquet; partition pruning on year(posting_date) and company_code. |
| **Transformation** | `transform/` — dbt project `sap_odi` | Medallion: bronze sources → silver views (decode + join) → gold tables (facts/dims/marts). |
| **Serving** | `keystone-app/frontend/` + AI agent | The frontend reads a JSON snapshot of the gold layer. The /agent page reads the lake directly via the Glue catalog. |

## The five undercurrents (Ch. 2)

| Undercurrent | What we do |
|---|---|
| **Security** | IAM roles per consumer (Fivetran role, dbt role) with least-privilege S3 + Glue scopes. Fivetran trust gated by external ID. No SAP credentials in this repo — they live in the Slab demo-system page. |
| **Data management** | Bronze sources documented in `models/bronze/sources.yml` with column-level descriptions. Silver and gold schema yml files declare tests. SAP cryptic-name decoder lives in `AGENTS.md`. |
| **DataOps** | `dbt test` enforces the contract on every build (not_null, unique, accepted_values). Failed tests halt downstream materialization. Lineage is `dbt docs generate`-discoverable. |
| **Orchestration** | Fivetran SaaS handles ingestion; GitHub Actions (`.github/workflows/dbt_run.yml` — TODO) runs `dbt build` post-sync. The Keystone production runbook would wire a Fivetran webhook into the Action trigger. |
| **Software engineering** | dbt project is version-controlled, code-reviewable, deployable. No SQL lives in BI tools. Same engineering rigor as the application codebase. |

## Choices we deliberately made

### Silver = views, gold = Iceberg tables
The silver layer renames and joins but does not aggregate; making it a
view keeps the project nimble. Gold layer is materialized as Iceberg
parquet for queryable performance from any engine without a warm cache.

### Outstanding-balance DSO, not accrual ratio
The naïve `monthly AR / monthly revenue` ratio is mathematically the
same every month if AR is just the month's posting (which it would be
if you never simulated cash receipts). The mart_dso convention here is
*outstanding AR at month-end / revenue billed in that month*. That's
what an external auditor or treasury team would compute.

### Surrogate keys in gold, natural keys preserved
Every fact has a `*_key` surrogate (md5 of grain columns via
`dbt_utils.generate_surrogate_key`) for join stability, alongside the
natural SAP keys (`document_number`, `sales_doc_id`, etc.). Surrogate
keys protect against grain changes; natural keys keep audit trail.

### Partitioning
Iceberg partition specs follow query patterns:

- `fct_gl_journal` — `year(posting_date), company_code` (most queries filter on year and entity)
- `fct_sales_orders`, `fct_invoices`, `fct_purchase_orders` — `year(<event_date>)`

Reis & Housley caution against over-partitioning small tables.
Inventory snapshot and dim_* tables are unpartitioned because they're
small and queried in full.

### No incremental models (yet)
For the demo, all gold tables are full-refresh on every dbt build. In
production at Keystone volume, you'd switch the high-traffic facts to
incremental with a high-watermark filter on `loaded_at`. Iceberg's
upsert support makes incremental MERGE clean — that's a Keystone-team
follow-on, not a demo-day requirement.

### Tests as the contract
Every silver+gold model with a meaningful grain has a uniqueness test
on the grain key and a not-null test on the join columns. If those fail,
nothing downstream materializes. That's the Reis & Housley undercurrent
("data quality") expressed as code.

## Things the demo does NOT do (and why)

| Capability | Status | Why not (yet) |
|---|---|---|
| Streaming ingestion | Not implemented | SAP source updates at trigger cadence (sub-minute). True streaming would be DataStream/Kafka pre-Iceberg; that's a v2 conversation. |
| Reverse ETL | Not implemented | Demo is a read-side narrative. If the prospect asks "how do I get insights back into SAP?", that's a Census/Hightouch conversation we steer toward separately. |
| Lake Formation column-level security | Not implemented | Demo runs IAM-scoped only. Enterprise rollout would add LF tag-based access on PII columns in KNA1 / LFA1. |
| dbt semantic layer in production | Defined, not deployed | `metrics/sap_metrics.yml` is the contract. Hooking it to Cube / dbt Cloud Semantic Layer is the customer's choice. |
