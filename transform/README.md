# dbt project — `sap_odi`

dbt project for Keystone Industries' SAP-on-Iceberg lakehouse. Athena 3
as the engine, Iceberg as the table format, Glue as the catalog.

## Layer model

```
bronze/   raw SAP tables as Fivetran lands them. Names and columns
          are SAP-cryptic (BUKRS, BELNR, DMBTR). Sources only — no
          transforms. Each .yml file declares one bronze schema.

silver/   stg_sap_<table>.sql renames every column to business English
          using the decoder in AGENTS.md. One stg model per SAP table.
          Intermediate models (int_*.sql) join header+item pairs
          (e.g. VBAK+VBAP → int_sales_order_lines).

gold/     facts, dims, and marts. Business semantics, business names.
          Every metric in metrics/sap_metrics.yml resolves through gold.
```

## The dbt Labs value-add story

The reason this layer matters for SAP customers specifically: an SAP
table called `BKPF` with a column called `BUKRS` referencing a join key
in `T001` is unreadable to anyone outside the SAP team. The silver layer
in this project encodes the institutional knowledge of "BUKRS is the
company code, BELNR is the document number, DMBTR is the local-currency
amount". Once that decoder is committed in dbt SQL, every downstream
consumer — BI, Python notebooks, an LLM agent — sees `company_code`,
`document_number`, `local_amount`. Knowledge that used to live in a
handful of SAP consultants now lives in version-controlled SQL.

## Models (planned)

### Silver

| Model | Decodes |
|---|---|
| `stg_sap_bkpf.sql` | Accounting document header |
| `stg_sap_bseg.sql` | Accounting document line items |
| `stg_sap_skat.sql` | GL account text |
| `stg_sap_skb1.sql` | GL account company-code data |
| `stg_sap_vbak.sql` | Sales order header |
| `stg_sap_vbap.sql` | Sales order item |
| `stg_sap_vbrk.sql` | Billing document header |
| `stg_sap_vbrp.sql` | Billing document item |
| `stg_sap_kna1.sql` | Customer master |
| `stg_sap_ekko.sql` | Purchase order header |
| `stg_sap_ekpo.sql` | Purchase order item |
| `stg_sap_rseg.sql` | Supplier invoice item |
| `stg_sap_lfa1.sql` | Vendor master |
| `stg_sap_mara.sql` | Material master |
| `stg_sap_marc.sql` | Material plant view |
| `stg_sap_mbew.sql` | Material valuation |
| `int_gl_journal.sql` | BKPF + BSEG header/item join, one row per posting line |
| `int_sales_order_lines.sql` | VBAK + VBAP, one row per SO line |
| `int_billing_lines.sql` | VBRK + VBRP, one row per invoice line |
| `int_po_lines.sql` | EKKO + EKPO, one row per PO line |

### Gold

| Model | Purpose |
|---|---|
| `dim_company.sql` | Company code dimension |
| `dim_gl_account.sql` | GL account + hierarchy text |
| `dim_customer.sql` | Customer (KNA1) cleaned |
| `dim_vendor.sql` | Vendor (LFA1) cleaned |
| `dim_material.sql` | Material (MARA + MARC + MBEW conformed) |
| `dim_plant.sql` | Plant dimension |
| `fct_gl_journal.sql` | Posting lines, signed amounts, period-aligned |
| `fct_sales_orders.sql` | One row per SO line, with status |
| `fct_invoices.sql` | One row per billing line |
| `fct_purchase_orders.sql` | One row per PO line, with goods-receipt status |
| `fct_supplier_invoices.sql` | One row per supplier invoice line (RSEG) |
| `fct_inventory_position.sql` | Plant × material valuation snapshot |
| `mart_trial_balance.sql` | Period-end balances by GL account |
| `mart_finance_close.sql` | Close progress: postings by day-of-period |
| `mart_dso.sql` | Days Sales Outstanding by customer + total |
| `mart_dpo.sql` | Days Payable Outstanding by vendor + total |
| `mart_order_to_cash.sql` | O2C cycle time per order |
| `mart_supplier_scorecard.sql` | On-time, in-spec, price compliance per vendor |
| `mart_inventory_turns.sql` | Turns per material × plant |

## Semantic layer

`metrics/sap_metrics.yml` will expose ~10 metrics keyed off gold:

- `gross_revenue` (sum of invoice line net amount)
- `gross_margin_pct`
- `dso_days`
- `dpo_days`
- `cash_conversion_cycle`
- `inventory_turns`
- `open_ar_balance`
- `open_ap_balance`
- `on_time_delivery_pct`
- `three_way_match_exception_rate`

Each is defined once and reused by `/finance`, `/o2c`, `/p2p`,
`/inventory`, and `/agent`. The semantic layer is one of the four
risk-area answers — "reusable semantics" is how we sidestep the cost
stacking the article calls out.
