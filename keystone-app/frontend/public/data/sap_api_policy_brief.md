---
source_url: https://www.fivetran.com/blog/saps-latest-api-policy-raises-the-stakes-for-your-ai-strategy
title: SAP's latest API policy raises the stakes for your AI strategy
author: Taylor Brown, Co-founder and COO, Fivetran
published: 2026-04-29
---

# SAP's latest API policy raises the stakes for your AI strategy

> Taylor Brown, Co-founder and COO at Fivetran — April 29, 2026

SAP published a new API policy that explicitly restricts AI usage. The
policy prohibits API access for *"interaction or integration with
(semi-)autonomous or generative AI systems"* and for *"scraping,
harvesting, or systematic data extraction"* unless that access flows
through SAP-controlled pathways.

The deadline matters: SAP will begin **blocking the ODP RFC interface in
July 2026**, with exceptions extending through year-end.

## The central tension

The policy reflects SAP's position that non-SAP system integration
should flow exclusively through SAP-controlled channels. That raises a
fundamental question for every enterprise running SAP:

> Should your AI strategy be governed by your vendor's commercial
> roadmap, or by your own business needs?

## Four risk areas

**1. Cost stacking.** Multiple SAP data products compound expenses when
external compute joins the architecture. You pay SAP for extraction, you
pay SAP for the analytical surface, and you pay again the moment you
want to land data anywhere else.

**2. Cloud inflexibility.** Restricted to vendor-certified services
rather than the full native cloud catalogs you already use. Your AWS,
Azure, or GCP investment is partially stranded.

**3. Architectural lock-in.** Business logic and security models stay
vendor-dependent. Migrations require complete rebuilds, not incremental
moves. The blast radius of any future change is the entire stack.

**4. AI dependency.** AI agent access to your own operational data is
limited to vendor-defined pathways. The pace of AI innovation in your
business is then capped by the pace of your vendor's AI product
roadmap, not your team's.

## What this means in practice

> "If you want to use AI agents to access SAP data directly via APIs,
> SAP wants that to happen on SAP's terms."

For Fivetran customers there is no immediate disruption — our SAP
connectors are unaffected. But the broader strategic question stands
for every SAP customer: where does your AI strategy live?

## Open Data Infrastructure as the counterbalance

Fivetran's position is that an open data infrastructure — your own
storage, decoupled compute, open table formats — is the only architecture
that preserves your optionality through this kind of policy shift:

- Customers retain full data ownership in their own lakes and warehouses.
- Storage and compute remain decoupled — no single-vendor analytical surface.
- Open table formats (Apache Iceberg, Delta Lake) preserve portability across engines.
- No artificial restrictions on where data flows or how AI systems access it.

> Your data belongs to you, not to your vendor. And the AI tools you
> choose should be your decision too.

---

*Original article: <https://www.fivetran.com/blog/saps-latest-api-policy-raises-the-stakes-for-your-ai-strategy>*
