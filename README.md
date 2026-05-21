# SAP-ODI-Demo · Keystone Industries

End-to-end demonstration of **Fivetran's Open Data Infrastructure (ODI)** in
an SAP S/4HANA setting. Keystone Industries is a fictional global discrete
manufacturer modeled after Caterpillar + Schneider Electric; the data flows
are real SAP table shapes.

## Why this demo exists now

On April 29, 2026 Taylor Brown (Fivetran COO) published *"SAP's latest API
policy raises the stakes for your AI strategy"*. SAP's new policy explicitly
restricts API access for "interaction or integration with (semi-)autonomous
or generative AI systems" and starts blocking the ODP RFC interface in July
2026 (exceptions through year-end).

The blog post is the narrative driver for this demo. The full text is
rendered in-app at `/policy` and is the first thing a viewer sees on the
landing page. The rest of the site exists to show, concretely, what an
SAP customer's analytics + AI stack looks like when the data lives in
their own Iceberg lake instead of behind a vendor-controlled gateway.

ODI's pitch in one line for SAP customers: **your SAP data lands in your
S3 + Iceberg + Glue, dbt builds the marts, and any engine or AI agent
reads it — no SAP-managed analytical product in the path.**

## Quick demo (synthetic only, ~30 seconds)

No SAP system, no AWS, no Fivetran. The snapshot JSONs are pre-built and
checked in under `keystone-app/frontend/public/data/`.

```bash
cd keystone-app/frontend
npm ci
npm run dev    # http://localhost:5173
```

```
   ┌────────────────────────────────────────────────────────────┐
   │  SAP S/4HANA (Keystone Industries — fictional)             │
   │  FI · CO · SD · MM · PP modules                            │
   └────────────────────────────┬───────────────────────────────┘
                                │  Fivetran SAP connector
                                │  (NetWeaver + Fivetran triggers, NOT ODP RFC)
                                ▼
   ┌────────────────────────────────────────────────────────────┐
   │  AWS S3 — Apache Iceberg tables in 3 schemas               │
   │    bronze_sap_fi.{bkpf, bseg, skat, skb1}                   │
   │    bronze_sap_sd.{vbak, vbap, vbrk, vbrp, kna1}             │
   │    bronze_sap_mm.{ekko, ekpo, rseg, lfa1}                   │
   │    bronze_sap_mat.{mara, marc, mbew}                        │
   │  Registered in AWS Glue Data Catalog                        │
   └────────────────────────────┬───────────────────────────────┘
                                │  dbt — decodes cryptic SAP names
                                │  bronze → silver → gold
                                ▼
   ┌────────────────────────────────────────────────────────────┐
   │  Silver — staging + intermediate (business-named columns)   │
   │  Gold   — marts + dbt semantic layer                        │
   │    fct_gl_journal · mart_trial_balance · mart_finance_close │
   │    fct_sales_orders · mart_order_to_cash · mart_dso         │
   │    fct_purchase_orders · mart_dpo · mart_supplier_scorecard │
   │    fct_inventory_position · mart_inventory_turns            │
   └────────────────────────────┬───────────────────────────────┘
                                │  AWS Athena · DuckDB · Trino · Spark
                                ▼
   ┌────────────────────────────────────────────────────────────┐
   │  React + Vite SPA on GitHub Pages                           │
   │  Policy · Finance · O2C · P2P · Inventory ·                 │
   │  ODI Architecture · AI Agent · Pipeline                     │
   └────────────────────────────────────────────────────────────┘
```

## Layout

| Path | What lives there |
|---|---|
| `connectors/` | Fivetran SAP connector configuration (managed connector, not SDK). README documents NetWeaver vs ODP RFC paths and the July 2026 deadline. |
| `infra/` | Terraform — S3 lake, Glue catalog, IAM roles, Athena workgroup |
| `transform/` | dbt project `sap_odi` — bronze sources, silver, gold + semantic layer. Decodes SAP cryptic names (BKPF.BUKRS → company_code) so every downstream consumer reads business English. |
| `keystone-app/frontend/` | React + Vite + Tailwind v4 SPA |
| `keystone-app/scripts/` | `build_snapshot.py`, `_synthetic.py` |
| `keystone-app/frontend/public/data/sap_api_policy_brief.md` | Taylor Brown article verbatim, rendered at `/policy` |

## Pages

- `/` — Hero anchored on the policy moment; one-paragraph excerpt + CTA to `/policy`
- `/policy` — Full Taylor Brown article rendered, with a side-panel mapping each of the four risk areas (cost stacking, cloud inflexibility, architectural lock-in, AI dependency) to a concrete ODI countermeasure shown elsewhere in this app
- `/finance` — Trial balance, finance close progress, DSO/DPO trend, GL drill-down
- `/o2c` — Order-to-cash funnel, on-time fulfillment, blocked orders, customer DSO ranking
- `/p2p` — Supplier scorecard, payment-terms compliance, three-way-match exceptions, DPO
- `/inventory` — Material turns, slow-mover analysis, stockout exposure by plant
- `/architecture` — **The ODI page** — interactive lineage, multi-engine query showcase, MDS/SAP-BW vs ODI comparison
- `/agent` — Claude reads the gold layer directly. The point: no SAP RFC call, no SAP-licensed analytical compute, no policy violation
- `/pipeline` — 4-layer status with a deliberate "ODP RFC deprecation" failure simulator

## ODI value props mapped to SAP risk areas (per the blog post)

| Risk area (Taylor Brown) | Where ODI answers it | Where in this app |
|---|---|---|
| Cost stacking across SAP data products | Single Iceberg copy; any engine reads it | `/architecture` — five engines, one storage |
| Cloud inflexibility (vendor-certified only) | Native S3/Glue/Athena; no SAP cloud SKU | `/architecture` — Terraform under `infra/` |
| Architectural lock-in | Open table format (Iceberg); models are dbt SQL, portable | `/finance` source code link to `transform/` |
| AI dependency on vendor pathways | Agent queries Iceberg directly, no SAP API | `/agent` — Claude → parquet, no RFC |

## SAP data sources

| Module | Tables | What we model |
|---|---|---|
| FI (Financial Accounting) | `BKPF`, `BSEG`, `SKAT`, `SKB1` | GL journal, trial balance, account hierarchy, finance close |
| SD (Sales & Distribution) | `VBAK`, `VBAP`, `VBRK`, `VBRP`, `KNA1` | Sales orders, billing, customer master, DSO |
| MM (Materials Management) | `EKKO`, `EKPO`, `RSEG`, `LFA1` | POs, supplier invoices, vendor master, DPO |
| Materials / Inventory | `MARA`, `MARC`, `MBEW` | Material master, plant view, valuation, turns |

All synthetic in this repo. The Fivetran SAP connector (managed) is the
production path. See `connectors/README.md` for the NetWeaver-triggers path we recommend
and why it sidesteps the ODP RFC deprecation.

## AWS deployment

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

## Demo environment

The live SAP source for this demo lives in the Fivetran SE Slab. Find the
"SAP S/4HANA Demo System" page for hostname, client, NetWeaver RFC credentials, and
the schema list. The Slab page is the source of truth for connection
details and is NOT mirrored here for security reasons. Until that is wired,
the synthetic snapshot under `keystone-app/frontend/public/data/` covers
the entire site.

## License

Demonstration code. Synthetic data unless connected to a live SAP source.
Not for production financial reporting or operational decisions.
