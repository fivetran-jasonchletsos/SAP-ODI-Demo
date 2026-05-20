# AGENTS.md

Operator guide for future Claude sessions and the Keystone demo team. Keep brief.

## Narrative driver

This demo exists to make Taylor Brown's April 29, 2026 Fivetran blog post
*"SAP's latest API policy raises the stakes for your AI strategy"* tangible.
The article text is committed at `keystone-app/frontend/public/data/sap_api_policy_brief.md`
and is rendered verbatim at `/policy`. Every page in the app should
ultimately tie back to one of the four risk areas the article calls out:

1. Cost stacking
2. Cloud inflexibility
3. Architectural lock-in
4. AI dependency

If a screen does not answer one of those four, cut it or relabel it.

## Repo layout

| Dir | What |
|---|---|
| `connectors/` | Fivetran SAP connector docs. Managed connector — no SDK code. Documents SLT vs ODP RFC paths and the July 2026 deprecation. |
| `infra/` | Terraform — S3 lake bucket, Glue catalog DBs, IAM (Fivetran + dbt), Athena workgroup. |
| `transform/` | dbt project `sap_odi` on Athena/Iceberg. Layers: `models/bronze` (sources only — raw SAP names), `models/silver` (stg = business-named columns), `models/gold` (facts/dims/marts + semantic layer in `metrics/`). |
| `keystone-app/frontend/` | React + Vite + Tailwind v4 SPA. **Off-limits to backend agents.** |
| `keystone-app/scripts/` | `build_snapshot.py` (Athena → JSON), `_synthetic.py` (deterministic fallback). |

## Demo environment (Slab)

Live SAP connection details are in the Fivetran SE Slab under the page
**"SAP S/4HANA Demo System"**. Look up hostname, client, SLT credentials,
and active schemas there. Do not commit credentials.

If the Slab page is unreachable, the committed synthetic snapshot under
`keystone-app/frontend/public/data/` exercises every page in the site.

## SAP table → business-name decoder

The point of the silver layer is that every downstream consumer sees
business English, never SAP cryptic names. The standard renames:

| SAP raw | Business name |
|---|---|
| `BUKRS` | `company_code` |
| `BELNR` | `document_number` |
| `BLDAT` | `document_date` |
| `BUDAT` | `posting_date` |
| `WAERS` | `currency` |
| `DMBTR` | `local_amount` |
| `WRBTR` | `document_amount` |
| `HKONT` | `gl_account` |
| `KUNNR` | `customer_id` |
| `LIFNR` | `vendor_id` |
| `MATNR` | `material_id` |
| `WERKS` | `plant_id` |
| `EBELN` | `purchase_order_id` |
| `VBELN` | `sales_doc_id` |
| `POSNR` | `line_item` |

Add to this list as new tables get ingested. Each `silver/stg_sap_<table>.sql`
should apply this decoder uniformly.

## Run the demo locally (no creds)

```bash
cd keystone-app/frontend && npm ci && npm run dev
```

## Regenerate the snapshot

```bash
cd keystone-app && python scripts/build_snapshot.py
```

With AWS creds (`AWS_REGION`, `LAKE_BUCKET`, `ATHENA_WORKGROUP`) it queries
the gold layer; without, it falls back to `_synthetic.py`.

## Athena/Presto SQL gotchas

- `date_add('day', -90, current_date)` — not `DATE_DIFF(end, start)`.
- `current_date` / `current_timestamp` — no parentheses.
- `cast(x as double)` — no `::` syntax.
- `to_unixtime(ts)` — no `extract(epoch from ...)`.
- Partition spec `bucket(8, customer_id)` and `year(posting_date)` are Athena 3 / Iceberg.

## ODI talking points the site supports

| Pillar | Page |
|---|---|
| Open storage (Iceberg in S3, Glue-cataloged) | `/architecture` |
| Multi-engine (Athena, DuckDB, Trino, Spark) | `/architecture` |
| Reusable semantics (one metric definition, many consumers) | `transform/metrics/sap_metrics.yml` |
| AI-ready (Claude reads parquet directly — NO SAP RFC, NO SAP-managed analytical compute) | `/agent` |
| No lock-in (SAP BW/Datasphere vs ODI comparison) | `/architecture` |

## Guardrails

Never commit SAP credentials or real Slab tokens. Don't reformat dbt SQL.
Frontend belongs to another agent. The policy brief markdown is verbatim
from the article — do not summarize, paraphrase, or edit it; only update
if Fivetran publishes a revised version.
