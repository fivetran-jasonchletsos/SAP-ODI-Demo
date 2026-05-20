# Fivetran SAP connector — Keystone Industries

Unlike the other ODI demos in this family, the SAP source is a **managed
Fivetran connector**, not a Connector-SDK project. So there is no Python
`connector.py` in this directory — there is a connector configuration
recipe and a runbook.

## Why this connector matters now

Taylor Brown's April 29, 2026 post (rendered in-app at `/policy`)
flagged that SAP will begin blocking the **ODP RFC interface in July 2026**,
with exceptions through year-end. Any data pipeline that pulls SAP data
through ODP RFC is on a hard deprecation clock.

Fivetran's SAP connector has two extraction paths. We deliberately use
the one that is not affected.

| Path | Status as of 2026-05 | Use in this demo |
|---|---|---|
| **SLT-based** (SAP Landscape Transformation) — trigger-based change data capture from SAP system tables | Unaffected by the new policy. Recommended path. | Yes — this is what Keystone uses. |
| **ODP RFC** (Operational Data Provisioning via RFC) | Blocking begins July 2026, exceptions through year-end | Do not use for new connectors. |

The Fivetran SLT path operates on application-tier table changes, not the
restricted RFC surface, so it sits cleanly outside the policy.

## Source system

Keystone Industries runs SAP S/4HANA on-premise with SLT replicating to
Fivetran. Modules in scope:

- **FI** — Financial Accounting (BKPF, BSEG, SKAT, SKB1)
- **CO** — Controlling (limited — cost centers and profit centers only)
- **SD** — Sales & Distribution (VBAK, VBAP, VBRK, VBRP, KNA1)
- **MM** — Materials Management (EKKO, EKPO, RSEG, LFA1)
- **PP** — Production Planning (limited — AFKO, AFPO)
- **Materials** — Master data (MARA, MARC, MBEW)

## Connector configuration (recipe)

In the Fivetran dashboard:

```
Connector type:        SAP ERP (SLT)
Source group:          Keystone-S4HANA-DEV
Destination schemas:   bronze_sap_fi, bronze_sap_sd, bronze_sap_mm, bronze_sap_mat
Sync frequency:        15 minutes (CDC)
Table selection:       BKPF, BSEG, SKAT, SKB1,
                       VBAK, VBAP, VBRK, VBRP, KNA1,
                       EKKO, EKPO, RSEG, LFA1,
                       MARA, MARC, MBEW
Column hashing:        none (demo system, no PII)
Historical sync:       full re-sync on first run, then CDC
```

## Demo environment access

The live SAP S/4HANA demo system that backs this Fivetran connector
lives in the Fivetran SE Slab. Look up the page titled
**"SAP S/4HANA Demo System"** for:

- Hostname / system ID / client number
- SLT replication server credentials
- The list of currently-active schemas (occasionally rotated)
- Snowflake / S3 destination credentials matched to this source

Do not commit any of those values here.

If the Slab page is unreachable or the demo system is down, every page
in the Keystone app remains fully functional against the committed
synthetic snapshot under `keystone-app/frontend/public/data/`.

## Runbook

1. Verify the demo system is up: check the heartbeat row in Slab.
2. In Fivetran, edit the connector's table list to match the section above.
3. Trigger an initial historical sync. Expect ~10 min for the demo dataset.
4. Verify the bronze schemas materialized in S3 (Iceberg via Glue).
5. Trigger the dbt run: `cd transform && dbt build`.
6. Regenerate the snapshot: `cd keystone-app && python scripts/build_snapshot.py`.
7. Commit the refreshed snapshot JSON if you want it to ship to GitHub Pages.
