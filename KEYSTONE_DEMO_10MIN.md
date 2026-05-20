# Keystone 10-minute demo — flow

Demo structure follows Peter Cohan's *Great Demo!* methodology — start
with the "Crucial Demo Outcome" (CDO), present the situation, then back
into the mechanics. Total runtime: ~10 minutes.

## CDO (Crucial Demo Outcome)

After this demo, the prospect should be able to articulate:
*"SAP just told me my AI strategy has to flow through SAP. Fivetran's
Open Data Infrastructure makes that constraint irrelevant — my SAP
data lands in my Iceberg lake, dbt builds the marts, any engine or
agent reads it, and SAP isn't in the analytical path."*

If they say it back to you in roughly those words, the demo worked.

## The "Do the Last Thing First" hook (60s)

Open on `/agent`. Type one question:

> Which vendors are below 90% three-way match?

Read the response. Then pause and say:

> "That answer came from Iceberg parquet on S3. We did not call an
> SAP API. We did not invoke SAP-managed compute. As of July 2026,
> SAP's new policy starts blocking the ODP RFC interface — and even
> if it weren't, the policy says AI agent integration has to happen
> on SAP's terms. The answer you just saw is governed by your IAM
> roles, not by SAP's commercial roadmap."

That's the punchline. Now go back and show the path.

## Act 1 — Situation (2 min)

Navigate to `/policy`. Show the verbatim Taylor Brown article.
Linger on the four risk areas in the right rail:

1. Cost stacking
2. Cloud inflexibility
3. Architectural lock-in
4. AI dependency

Land it: "Each of these maps to a page in this app. Let me show you."

## Act 2 — Vision (2 min)

Click into `/architecture`.

- **Engines tab** — click through Athena, DuckDB, Trino, Spark, Claude.
  "Same Iceberg parquet. Different engines. The customer picks."
- **Iceberg tables table** — "16 SAP tables landed in S3 by Fivetran SLT.
  Glue knows about them. Any AWS-native tool can query them tomorrow."
- **BW vs ODI comparison** — read row 3 aloud: "AI access — SAP BW
  requires their controlled pathway. ODI is direct parquet read."

## Act 3 — Mechanics (4 min)

Pick two of these depending on the prospect's persona. Don't show all
four — Cohan's "menu" approach: ask before you show.

**For a finance / FP&A audience:** `/finance`
> "DSO trend across the last 12 months. Target band is 30 to 45 days.
> This came from dbt joining BKPF, BSEG, and our cash-receipt postings
> in mart_dso. Source code is one file in the repo."

**For a supply-chain / procurement audience:** `/p2p`
> "Supplier scorecard. The bullet bar shows actual three-way match
> against the 90% target — Stephen Few-style visual; the gap is the
> story. Grade A/B/C/D drops out of mart_supplier_scorecard.sql."

**For a manufacturing operations audience:** `/inventory`
> "Slow movers. Turns below 1.0 means more inventory on hand than a
> year of revenue justifies. Joins MARA, MARC, MBEW — three SAP
> material tables that nobody outside the SAP team can read directly.
> The silver-layer dbt models decode the cryptic names."

**For a CIO / architect audience:** `/pipeline`
> "Failure simulator. The top entry is the ODP RFC deprecation in
> July — green because Keystone is on SLT, not RFC. The architecture
> choice from a year ago made the policy a non-event."

## Closing (60s)

Back to `/`. Point to the four KPI tiles.

> "Synthetic data, real architecture. The story is: SAP's commercial
> roadmap doesn't get to govern your AI strategy. The decision is
> upstream — pick storage and compute that aren't controlled by your
> ERP vendor. Fivetran + Iceberg + dbt is one way; we'd love to
> walk through what it would look like in your environment."

## What to skip if running short

- The trial balance table on `/finance` (looks like SAP, not necessary)
- The customer ranking on `/o2c`
- The pipeline page (cover it verbally instead)

## What to NEVER do

- Don't talk through the dbt SQL line-by-line. If they ask, open the
  repo, scroll to the file, let them read.
- Don't promise the SAP connector works against their specific
  S/4HANA release without checking the support matrix.
- Don't compare Fivetran to SAP Datasphere on price. The framing is
  optionality, not cost.

## Pre-demo discovery questions

See `KEYSTONE_DISCOVERY_CALL.md` for the question bank. Run discovery
first; *then* run the demo. Cohan: "Do discovery before demo, every
time."
