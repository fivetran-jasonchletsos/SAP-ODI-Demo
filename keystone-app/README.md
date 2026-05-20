# Keystone Industries — frontend + snapshot

React + Vite + Tailwind v4 SPA (mirrors the structure of Meridian, Atlas,
Lighthouse). Reads pre-built JSON from `frontend/public/data/`.

## Pages and data contract

Every page is driven by a single JSON file written by
`scripts/build_snapshot.py`. The synthetic generator
(`scripts/_synthetic.py`) writes the same shape from a fixed seed when
AWS is unavailable.

| Page | Route | JSON file | Key fields |
|---|---|---|---|
| Landing | `/` | `summary.json` | `kpis[]`, `policy_excerpt`, `last_sync_at` |
| Policy brief | `/policy` | `sap_api_policy_brief.md` (verbatim) + `policy_risk_map.json` | per-risk-area links into the rest of the app |
| Finance | `/finance` | `finance.json` | `trial_balance[]`, `close_progress[]`, `dso_trend[]`, `top_gl_postings[]` |
| Order-to-cash | `/o2c` | `o2c.json` | `funnel`, `on_time_delivery`, `blocked_orders[]`, `customer_dso[]` |
| Procure-to-pay | `/p2p` | `p2p.json` | `supplier_scorecard[]`, `payment_term_compliance`, `three_way_match[]` |
| Inventory | `/inventory` | `inventory.json` | `turns_by_material[]`, `slow_movers[]`, `stockout_risk[]` |
| Architecture | `/architecture` | `iceberg.json` | `tables[]`, `engines[]`, `lineage_nodes/edges`, `mds_vs_odi` |
| Agent | `/agent` | `agent.json` + live Claude call | `sample_questions[]`, `policy_callouts[]` |
| Pipeline | `/pipeline` | `pipeline.json` | `connector_status`, `layer_status[]`, `failure_sim` (incl. ODP RFC dep.) |

## The `/policy` page is the anchor

Render `sap_api_policy_brief.md` as the main column. The right rail is
a 4-row grid mapping each risk area to an in-app link:

| Risk area | Link target | Label |
|---|---|---|
| Cost stacking | `/architecture#engines` | "Five engines, one storage copy" |
| Cloud inflexibility | `/architecture#infra` | "Open Iceberg in your own S3" |
| Architectural lock-in | `/finance` (with "view source" → `transform/`) | "Marts are portable dbt SQL" |
| AI dependency | `/agent` | "Claude queries the lake directly — no SAP RFC" |

The right rail is what makes the article actionable inside the app
instead of just being a static blog excerpt.

## Local dev

```bash
cd frontend
npm ci
npm run dev   # http://localhost:5173
```

## Regenerate snapshot

```bash
cd keystone-app
python scripts/build_snapshot.py
```

Outputs all files under `frontend/public/data/`.

## Status

The frontend is not yet implemented in this directory — only the data
contract is fixed. A separate frontend agent owns the React build, per
the family's convention.
