"""
Deterministic SAP-shaped synthetic data for Keystone Industries.

Produces the JSON bundle the frontend reads from
keystone-app/frontend/public/data/. Seed is fixed so successive runs
are bit-identical — which is what lets the snapshot be committed.

This is NOT a SAP simulator. It produces business-meaningful outputs
shaped like what the gold layer of the dbt project would emit when
pointed at a live S/4HANA via the Fivetran SAP connector.
"""

from __future__ import annotations

import json
import math
import random
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

SEED = 42

COMPANY_CODES = [
    ("KS01", "Keystone Industries NA",    "USD", "United States"),
    ("KS02", "Keystone Industries EMEA",  "EUR", "Germany"),
    ("KS03", "Keystone Industries APAC",  "JPY", "Japan"),
    ("KS04", "Keystone Industries LATAM", "BRL", "Brazil"),
]

PLANTS = [
    ("1000", "Houston",   "NA"),
    ("1010", "Chicago",   "NA"),
    ("2000", "Stuttgart", "EMEA"),
    ("2010", "Lyon",      "EMEA"),
    ("3000", "Yokohama",  "APAC"),
    ("3010", "Shanghai",  "APAC"),
    ("4000", "Sao Paulo", "LATAM"),
]

MATERIAL_GROUPS = [
    ("HYDRAULICS",  "Hydraulic components"),
    ("ELECTRONICS", "Electronic assemblies"),
    ("CASTINGS",    "Iron and steel castings"),
    ("FASTENERS",   "Bolts, nuts, washers"),
    ("BEARINGS",    "Bearings and bushings"),
    ("PACKAGING",   "Industrial packaging"),
]

CUSTOMER_NAMES = [
    "Atlas Construction Partners",  "Beltran Mining",            "Calidad Manufacturing SA",
    "Daikin Process Systems",       "Erickson Heavy Equipment",  "Foroughi Petrochem",
    "Granite Bay Industrial",       "Hyundai Marine Services",   "Indus Power Holdings",
    "Jensen Forge Works",           "Kawasaki Rail Systems",     "Lindberg Aerospace",
    "Morita Chemical",              "Northshore Drilling",       "Otto Maschinenbau GmbH",
    "Pacific Rim Logistics",        "Quinto Energia Brasil",     "Rosenthal Wind Power",
    "Stenholm Marine AB",           "Tata Heavy Industries",     "Uesugi Construction",
    "Vasquez Drilling Services",    "Wakeman Foundry",           "Xinjiang Industrial",
    "Yousef Engineering",           "Zimmermann Werke",
]

VENDOR_NAMES = [
    "Allied Castings Inc.",   "Bremen Stahlwerke GmbH",   "Chongqing Forge Co.",
    "Dexter Bearings Ltd.",   "Eldorado Hydraulics",      "Fasten-It Inc.",
    "Gebhardt Komponenten",   "Hokuriku Electronics",     "ISO Industrial Supply",
    "Joliet Precision",       "Krupp Spezialstahl",       "Lone Star Fittings",
    "Meridian Packaging",     "Nakatomi Components",      "Osaka Mechatronics",
    "Pratt Industrial",       "Quality First Plastics",   "Reichmann Werke",
    "Sao Paulo Soldas",       "Tecnomec Italia SRL",
]


def _seeded() -> random.Random:
    return random.Random(SEED)


def _doc_num(prefix: str, i: int) -> str:
    return f"{prefix}{i:010d}"


def _daterange_quarterly(years_back: int) -> list[date]:
    today = date(2026, 5, 20)
    start = date(today.year - years_back, 1, 1)
    days = (today - start).days
    return [start + timedelta(days=d) for d in range(days)]


def generate() -> dict[str, Any]:
    rng = _seeded()
    today = date(2026, 5, 20)

    # ---- master data ----
    customers = []
    for i, name in enumerate(CUSTOMER_NAMES):
        country = rng.choice(["US", "DE", "JP", "BR", "GB", "CN", "FR", "CA", "MX"])
        region_bucket = {
            "US": "NA", "CA": "NA", "MX": "NA",
            "DE": "EMEA", "GB": "EMEA", "FR": "EMEA",
            "JP": "APAC", "CN": "APAC",
            "BR": "LATAM",
        }.get(country, "OTHER")
        customers.append({
            "customer_id":   f"C{i+1000:06d}",
            "customer_name": name,
            "country":       country,
            "region_bucket": region_bucket,
        })

    vendors = []
    for i, name in enumerate(VENDOR_NAMES):
        country = rng.choice(["US", "DE", "JP", "CN", "BR", "IT"])
        region_bucket = {
            "US": "NA", "DE": "EMEA", "IT": "EMEA",
            "JP": "APAC", "CN": "APAC", "BR": "LATAM",
        }.get(country, "OTHER")
        vendors.append({
            "vendor_id":     f"V{i+2000:06d}",
            "vendor_name":   name,
            "country":       country,
            "region_bucket": region_bucket,
        })

    materials = []
    for i in range(60):
        group = rng.choice(MATERIAL_GROUPS)
        plant = rng.choice(PLANTS)
        price = round(rng.uniform(5.0, 850.0), 2)
        materials.append({
            "material_id":          f"M{i+5000:08d}",
            "material_type":        "FERT" if i % 3 else "ROH",
            "material_group":       group[0],
            "material_group_label": group[1],
            "base_unit_of_measure": rng.choice(["EA", "KG", "M", "PC"]),
            "plant_id":             plant[0],
            "plant_name":           plant[1],
            "standard_price":       price,
            "currency":             "USD",
        })

    # ---- transactional facts ----
    sales_orders, invoices, billing_rows = [], [], []
    so_seq = 0
    for q in range(-7, 1):                                  # last 8 quarters
        quarter_start = date(today.year + (today.month - 1 + q*3) // 12,
                             ((today.month - 1 + q*3) % 12) + 1, 1)
        for _ in range(rng.randint(110, 180)):
            so_seq += 1
            so_id = _doc_num("SO", so_seq)
            customer = rng.choice(customers)
            created = quarter_start + timedelta(days=rng.randint(0, 89))
            line_count = rng.randint(1, 4)
            for line in range(1, line_count + 1):
                material = rng.choice(materials)
                qty = rng.randint(5, 250)
                value = round(qty * material["standard_price"] * rng.uniform(1.05, 1.45), 2)
                # bill it sometimes
                billed = rng.random() < 0.78
                days_to_bill = rng.randint(7, 65) if billed else None
                bill_date = created + timedelta(days=days_to_bill) if billed else None
                sales_orders.append({
                    "sales_doc_id":      so_id,
                    "line_item":         line,
                    "created_date":      created.isoformat(),
                    "created_year":      created.year,
                    "created_quarter":   (created.month - 1) // 3 + 1,
                    "customer_id":       customer["customer_id"],
                    "customer_name":     customer["customer_name"],
                    "material_id":       material["material_id"],
                    "order_quantity":    qty,
                    "order_value":       value,
                    "plant_id":          material["plant_id"],
                    "currency":          "USD",
                    "billed_quantity":   qty if billed else 0,
                    "billed_value":      value if billed else 0,
                    "order_status":      "closed" if billed else "open",
                    "first_billing_date": bill_date.isoformat() if bill_date else None,
                    "days_to_first_bill": days_to_bill,
                })
                if billed:
                    invoices.append({
                        "billing_doc_id":     _doc_num("BI", len(invoices) + 1),
                        "line_item":          line,
                        "billing_type":       "F2",
                        "billing_date":       bill_date.isoformat(),
                        "billing_year":       bill_date.year,
                        "billing_month":      bill_date.month,
                        "customer_id":        customer["customer_id"],
                        "material_id":        material["material_id"],
                        "billed_quantity":    qty,
                        "invoice_amount":     value,
                        "source_sales_doc_id": so_id,
                        "currency":           "USD",
                    })

    # ---- purchase orders + supplier invoices ----
    pos = []
    supplier_invoices = []
    po_seq = 0
    for q in range(-7, 1):
        quarter_start = date(today.year + (today.month - 1 + q*3) // 12,
                             ((today.month - 1 + q*3) % 12) + 1, 1)
        for _ in range(rng.randint(70, 130)):
            po_seq += 1
            po_id = _doc_num("PO", po_seq)
            vendor = rng.choice(vendors)
            company = rng.choice(COMPANY_CODES)[0]
            po_date = quarter_start + timedelta(days=rng.randint(0, 89))
            for line in range(1, rng.randint(1, 4) + 1):
                material = rng.choice(materials)
                qty = rng.randint(20, 800)
                price = round(material["standard_price"] * rng.uniform(0.7, 0.95), 2)
                value = round(qty * price, 2)
                fully = rng.random() < 0.68
                partial = (not fully) and rng.random() < 0.5
                invoiced_qty = qty if fully else (qty * rng.uniform(0.3, 0.85) if partial else 0)
                invoiced_amt = round(invoiced_qty * price, 2)
                status = "closed" if fully else ("partial" if partial else "open")
                pos.append({
                    "purchase_order_id":  po_id,
                    "line_item":          line,
                    "company_code":       company,
                    "po_date":            po_date.isoformat(),
                    "po_year":            po_date.year,
                    "po_quarter":         (po_date.month - 1) // 3 + 1,
                    "vendor_id":          vendor["vendor_id"],
                    "vendor_name":        vendor["vendor_name"],
                    "material_id":        material["material_id"],
                    "po_quantity":        qty,
                    "net_price":          price,
                    "po_line_value":      value,
                    "plant_id":           material["plant_id"],
                    "invoiced_quantity":  round(invoiced_qty, 2),
                    "invoiced_amount":    invoiced_amt,
                    "po_line_status":     status,
                    "three_way_match_complete": 1 if fully else 0,
                    "currency":           "USD",
                })
                if invoiced_amt > 0:
                    rec_date = po_date + timedelta(days=rng.randint(7, 45))
                    supplier_invoices.append({
                        "invoice_doc_id":   _doc_num("SI", len(supplier_invoices) + 1),
                        "fiscal_year":      rec_date.year,
                        "line_item":        line,
                        "purchase_order_id": po_id,
                        "vendor_id":        vendor["vendor_id"],
                        "material_id":      material["material_id"],
                        "po_date":          po_date.isoformat(),
                        "invoice_date":     rec_date.isoformat(),
                        "invoiced_quantity": round(invoiced_qty, 2),
                        "invoiced_amount":  invoiced_amt,
                    })

    # ---- GL journal: derive from invoices + supplier_invoices for realism ----
    gl_rows = []
    gl_seq = 0
    for inv in invoices:
        gl_seq += 1
        gl_rows.append({
            "document_number":    _doc_num("GL", gl_seq),
            "company_code":       "KS01",
            "posting_date":       inv["billing_date"],
            "posting_year":       inv["billing_year"],
            "posting_month":      inv["billing_month"],
            "gl_account":         "120100",
            "gl_account_description": "Trade receivables - third party",
            "account_class":      "asset",
            "signed_local_amount": inv["invoice_amount"],
            "customer_id":        inv["customer_id"],
            "vendor_id":          None,
            "currency":           "USD",
        })
        gl_rows.append({
            "document_number":    _doc_num("GL", gl_seq),
            "company_code":       "KS01",
            "posting_date":       inv["billing_date"],
            "posting_year":       inv["billing_year"],
            "posting_month":      inv["billing_month"],
            "gl_account":         "400000",
            "gl_account_description": "Revenue - finished goods",
            "account_class":      "revenue",
            "signed_local_amount": -inv["invoice_amount"],
            "customer_id":        None,
            "vendor_id":          None,
            "currency":           "USD",
        })

    for si in supplier_invoices:
        gl_seq += 1
        gl_rows.append({
            "document_number":    _doc_num("GL", gl_seq),
            "company_code":       "KS01",
            "posting_date":       si["invoice_date"],
            "posting_year":       int(si["invoice_date"][:4]),
            "posting_month":      int(si["invoice_date"][5:7]),
            "gl_account":         "210100",
            "gl_account_description": "Trade payables - third party",
            "account_class":      "liability",
            "signed_local_amount": -si["invoiced_amount"],
            "customer_id":        None,
            "vendor_id":          si["vendor_id"],
            "currency":           "USD",
        })
        gl_rows.append({
            "document_number":    _doc_num("GL", gl_seq),
            "company_code":       "KS01",
            "posting_date":       si["invoice_date"],
            "posting_year":       int(si["invoice_date"][:4]),
            "posting_month":      int(si["invoice_date"][5:7]),
            "gl_account":         "510000",
            "gl_account_description": "COGS - raw materials",
            "account_class":      "expense",
            "signed_local_amount": si["invoiced_amount"],
            "customer_id":        None,
            "vendor_id":          None,
            "currency":           "USD",
        })

    # ---- inventory position ----
    inventory = []
    for m in materials:
        on_hand = rng.randint(50, 1200)
        inventory.append({
            "material_id":         m["material_id"],
            "material_group":      m["material_group"],
            "plant_id":            m["plant_id"],
            "plant_name":          m["plant_name"],
            "on_hand_quantity":    on_hand,
            "standard_price":      m["standard_price"],
            "inventory_value":     round(on_hand * m["standard_price"], 2),
            "currency":            "USD",
        })

    return {
        "today":            today.isoformat(),
        "companies":        [{"company_code": c[0], "company_name": c[1],
                              "currency": c[2], "country": c[3]} for c in COMPANY_CODES],
        "plants":           [{"plant_id": p[0], "plant_name": p[1], "region": p[2]} for p in PLANTS],
        "customers":        customers,
        "vendors":          vendors,
        "materials":        materials,
        "sales_orders":     sales_orders,
        "invoices":         invoices,
        "purchase_orders":  pos,
        "supplier_invoices": supplier_invoices,
        "gl_journal":       gl_rows,
        "inventory":        inventory,
    }


# ----------------- snapshot shaping (frontend contract) -----------------

def _kpi(label: str, value: str, sublabel: str | None = None) -> dict[str, Any]:
    return {"label": label, "value": value, "sublabel": sublabel}


def shape_summary(d: dict[str, Any]) -> dict[str, Any]:
    total_revenue = sum(i["invoice_amount"] for i in d["invoices"])
    total_spend   = sum(s["invoiced_amount"] for s in d["supplier_invoices"])
    total_orders  = len({so["sales_doc_id"] for so in d["sales_orders"]})
    open_pos      = sum(1 for p in d["purchase_orders"] if p["po_line_status"] != "closed")
    return {
        "today":           d["today"],
        "last_sync_at":    datetime(2026, 5, 20, 14, 22).isoformat() + "Z",
        "policy_excerpt":  (
            "SAP will begin blocking the ODP RFC interface in July 2026 and has "
            "introduced policy language that explicitly restricts AI agent access "
            "to SAP data via APIs. Keystone's pipeline runs Fivetran SLT, lands "
            "Iceberg into our own S3, and lets any engine — or any AI agent — "
            "query the gold layer directly. We are not on the policy clock."
        ),
        "kpis": [
            _kpi("Gross Revenue (TTM)",  f"${total_revenue/1_000_000:.1f}M"),
            _kpi("Procurement Spend",    f"${total_spend/1_000_000:.1f}M"),
            _kpi("Sales Orders",         f"{total_orders:,}"),
            _kpi("Open PO Lines",        f"{open_pos:,}"),
            _kpi("SAP Tables Replicated", "16",  "FI · SD · MM · Materials"),
            _kpi("Extraction Path",      "SLT", "not ODP RFC (deprecating July 2026)"),
        ],
    }


def shape_finance(d: dict[str, Any]) -> dict[str, Any]:
    # trial balance from gl
    tb: dict[str, dict[str, Any]] = {}
    for r in d["gl_journal"]:
        key = r["gl_account"]
        slot = tb.setdefault(key, {
            "gl_account": key,
            "gl_account_description": r["gl_account_description"],
            "account_class": r["account_class"],
            "debit_total": 0.0, "credit_total": 0.0, "net_balance": 0.0,
        })
        amt = r["signed_local_amount"]
        if amt >= 0:
            slot["debit_total"] += amt
        else:
            slot["credit_total"] += -amt
        slot["net_balance"] += amt

    # DSO trend by month
    by_month: dict[str, dict[str, float]] = {}
    for inv in d["invoices"]:
        key = f"{inv['billing_year']}-{inv['billing_month']:02d}"
        by_month.setdefault(key, {"revenue": 0.0, "ar": 0.0})
        by_month[key]["revenue"] += inv["invoice_amount"]
    for gl in d["gl_journal"]:
        if gl["account_class"] == "asset" and gl["customer_id"]:
            key = f"{gl['posting_year']}-{gl['posting_month']:02d}"
            by_month.setdefault(key, {"revenue": 0.0, "ar": 0.0})
            by_month[key]["ar"] += gl["signed_local_amount"]
    dso_trend = []
    for k in sorted(by_month):
        rev = by_month[k]["revenue"]
        ar  = by_month[k]["ar"]
        dso = (ar / rev) * 30.0 if rev else None
        dso_trend.append({"period": k, "revenue": round(rev, 2), "ar": round(ar, 2),
                          "dso_days": round(dso, 1) if dso else None})

    # close progress curve (current month)
    cur = datetime.fromisoformat(d["today"])
    cur_year, cur_month = cur.year, cur.month
    days_in_month = [r["posting_date"] for r in d["gl_journal"]
                     if r["posting_year"] == cur_year and r["posting_month"] == cur_month]
    by_day: dict[str, int] = {}
    for ds in days_in_month:
        by_day[ds] = by_day.get(ds, 0) + 1
    close_progress = []
    cum = 0
    total = sum(by_day.values())
    for ds in sorted(by_day):
        cum += by_day[ds]
        close_progress.append({
            "posting_date": ds,
            "posting_count": by_day[ds],
            "cumulative": cum,
            "pct_complete": round(100 * cum / total, 1) if total else 0.0,
        })

    return {
        "trial_balance":   sorted(tb.values(), key=lambda r: r["gl_account"]),
        "dso_trend":       dso_trend,
        "close_progress":  close_progress,
        "top_gl_postings": sorted(d["gl_journal"], key=lambda r: -abs(r["signed_local_amount"]))[:25],
    }


def shape_o2c(d: dict[str, Any]) -> dict[str, Any]:
    funnel = {"created": 0, "billed": 0, "open": 0}
    for so in d["sales_orders"]:
        funnel["created"] += 1
        if so["order_status"] == "closed":
            funnel["billed"] += 1
        else:
            funnel["open"] += 1
    # on-time delivery proxy
    on_time = sum(1 for so in d["sales_orders"]
                  if (so["days_to_first_bill"] or 99) <= 30 and so["order_status"] == "closed")
    closed = max(1, funnel["billed"])
    blocked = [so for so in d["sales_orders"] if so["order_status"] == "open"
               and so["days_to_first_bill"] is None][:30]
    # customer DSO ranking
    by_cust: dict[str, dict[str, float]] = {}
    for so in d["sales_orders"]:
        by_cust.setdefault(so["customer_id"], {
            "customer_id": so["customer_id"],
            "customer_name": so["customer_name"],
            "revenue": 0.0, "open_value": 0.0, "order_count": 0,
        })
        by_cust[so["customer_id"]]["order_count"] += 1
        if so["order_status"] == "closed":
            by_cust[so["customer_id"]]["revenue"] += so["billed_value"]
        else:
            by_cust[so["customer_id"]]["open_value"] += so["order_value"]
    return {
        "funnel":            funnel,
        "on_time_delivery":  {"on_time": on_time, "total_closed": closed,
                              "pct": round(100 * on_time / closed, 1)},
        "blocked_orders":    blocked,
        "customer_ranking":  sorted(by_cust.values(), key=lambda r: -r["revenue"])[:30],
        "o2c_bands":         _o2c_bands(d["sales_orders"]),
    }


def _o2c_bands(orders: list[dict[str, Any]]) -> list[dict[str, Any]]:
    bands = {"fast": 0, "normal": 0, "slow": 0, "very_slow": 0, "unbilled": 0}
    for so in orders:
        d = so["days_to_first_bill"]
        if d is None:           bands["unbilled"] += 1
        elif d <= 14:           bands["fast"] += 1
        elif d <= 30:           bands["normal"] += 1
        elif d <= 60:           bands["slow"] += 1
        else:                   bands["very_slow"] += 1
    return [{"band": k, "count": v} for k, v in bands.items()]


def shape_p2p(d: dict[str, Any]) -> dict[str, Any]:
    by_v: dict[str, dict[str, Any]] = {}
    for p in d["purchase_orders"]:
        slot = by_v.setdefault(p["vendor_id"], {
            "vendor_id":     p["vendor_id"],
            "vendor_name":   p["vendor_name"],
            "po_line_count": 0,
            "total_po_value": 0.0,
            "total_invoiced": 0.0,
            "closed":        0,
            "open":          0,
            "partial":       0,
        })
        slot["po_line_count"] += 1
        slot["total_po_value"] += p["po_line_value"]
        slot["total_invoiced"] += p["invoiced_amount"]
        slot[p["po_line_status"]] = slot.get(p["po_line_status"], 0) + 1
    scorecard = []
    for v in by_v.values():
        pct = (100.0 * v["closed"] / v["po_line_count"]) if v["po_line_count"] else 0.0
        grade = "A" if v["po_line_count"] >= 50 and pct >= 95 else "B" if pct >= 90 else "C" if pct >= 80 else "D"
        v["three_way_match_pct"] = round(pct, 1)
        v["supplier_grade"] = grade
        scorecard.append(v)
    # 3-way match exceptions
    exceptions = [p for p in d["purchase_orders"] if p["po_line_status"] == "partial"][:30]
    # spend by month
    by_month: dict[str, float] = {}
    for s in d["supplier_invoices"]:
        key = s["invoice_date"][:7]
        by_month[key] = by_month.get(key, 0.0) + s["invoiced_amount"]
    spend_trend = [{"period": k, "spend": round(v, 2)} for k, v in sorted(by_month.items())]
    return {
        "supplier_scorecard":   sorted(scorecard, key=lambda r: -r["total_po_value"])[:40],
        "three_way_exceptions": exceptions,
        "spend_trend":          spend_trend,
        "payment_term_compliance": {"on_time": 312, "late": 47, "early": 19},
    }


def shape_inventory(d: dict[str, Any]) -> dict[str, Any]:
    # turn calculation against TTM invoice revenue (proxy)
    inv_by_mat: dict[str, float] = {}
    for inv in d["invoices"]:
        inv_by_mat[inv["material_id"]] = inv_by_mat.get(inv["material_id"], 0.0) + inv["invoice_amount"]
    rows = []
    for it in d["inventory"]:
        cogs = inv_by_mat.get(it["material_id"], 0.0)
        turns = (cogs / it["inventory_value"]) if it["inventory_value"] else None
        if turns is None:                  band = "no_movement"
        elif turns < 1:                    band = "slow"
        elif turns < 4:                    band = "normal"
        else:                              band = "fast"
        rows.append({**it, "ttm_revenue_proxy": round(cogs, 2),
                     "turns": round(turns, 2) if turns is not None else None,
                     "turn_band": band})
    return {
        "turns_by_material": sorted(rows, key=lambda r: -(r["turns"] or 0))[:50],
        "slow_movers":       [r for r in rows if r["turn_band"] in ("slow","no_movement")][:30],
        "value_by_plant":    _agg(rows, "plant_id", "inventory_value"),
        "value_by_group":    _agg(rows, "material_group", "inventory_value"),
    }


def _agg(rows: list[dict[str, Any]], key: str, metric: str) -> list[dict[str, Any]]:
    out: dict[str, float] = {}
    for r in rows:
        out[r[key]] = out.get(r[key], 0.0) + r[metric]
    return [{key: k, metric: round(v, 2)} for k, v in sorted(out.items(), key=lambda kv: -kv[1])]


def shape_iceberg(d: dict[str, Any]) -> dict[str, Any]:
    tables = []
    for schema, table, rows in [
        ("bronze_sap_fi",  "bkpf", len({(r["company_code"], r["document_number"]) for r in d["gl_journal"]})),
        ("bronze_sap_fi",  "bseg", len(d["gl_journal"])),
        ("bronze_sap_fi",  "skat", 248),
        ("bronze_sap_fi",  "skb1", 412),
        ("bronze_sap_sd",  "vbak", len({so["sales_doc_id"] for so in d["sales_orders"]})),
        ("bronze_sap_sd",  "vbap", len(d["sales_orders"])),
        ("bronze_sap_sd",  "vbrk", len({i["billing_doc_id"] for i in d["invoices"]})),
        ("bronze_sap_sd",  "vbrp", len(d["invoices"])),
        ("bronze_sap_sd",  "kna1", len(d["customers"])),
        ("bronze_sap_mm",  "ekko", len({p["purchase_order_id"] for p in d["purchase_orders"]})),
        ("bronze_sap_mm",  "ekpo", len(d["purchase_orders"])),
        ("bronze_sap_mm",  "rseg", len(d["supplier_invoices"])),
        ("bronze_sap_mm",  "lfa1", len(d["vendors"])),
        ("bronze_sap_mat", "mara", len(d["materials"])),
        ("bronze_sap_mat", "marc", len(d["materials"])),
        ("bronze_sap_mat", "mbew", len(d["materials"])),
    ]:
        tables.append({
            "schema": schema, "table": table, "row_count": rows,
            "format": "Apache Iceberg", "storage": "s3://keystone-odi-lake/",
            "catalog": "AWS Glue",
        })
    engines = [
        {"name": "AWS Athena",       "use_case": "ad-hoc SQL, BI",            "sample_sql": "SELECT customer_id, SUM(invoice_amount)\nFROM gold.fct_invoices\nGROUP BY 1\nORDER BY 2 DESC LIMIT 10;"},
        {"name": "DuckDB",           "use_case": "laptop-local analytics",    "sample_sql": "INSTALL iceberg; LOAD iceberg;\nSELECT * FROM iceberg_scan('s3://keystone-odi-lake/gold/fct_invoices');"},
        {"name": "Trino",            "use_case": "federated multi-source",    "sample_sql": "SELECT * FROM iceberg.gold.fct_gl_journal\nWHERE posting_year = 2026;"},
        {"name": "Apache Spark",     "use_case": "ML feature engineering",    "sample_sql": "spark.read.format('iceberg').load('gold.fct_invoices').groupBy('customer_id').sum('invoice_amount')"},
        {"name": "Claude (LLM)",     "use_case": "agentic Q&A — no SAP RFC",  "sample_sql": "Agent queries the parquet directly via the Iceberg catalog.\nNo SAP API call. No analytical SKU. No policy violation."},
    ]
    lineage = {
        "nodes": [
            {"id": "sap",     "label": "SAP S/4HANA",      "group": "source"},
            {"id": "ft",      "label": "Fivetran SLT",     "group": "ingest"},
            {"id": "bronze",  "label": "Bronze (Iceberg)", "group": "lake"},
            {"id": "silver",  "label": "Silver (dbt)",     "group": "transform"},
            {"id": "gold",    "label": "Gold (dbt)",       "group": "transform"},
            {"id": "athena",  "label": "Athena",           "group": "engine"},
            {"id": "duckdb",  "label": "DuckDB",           "group": "engine"},
            {"id": "spark",   "label": "Spark",            "group": "engine"},
            {"id": "agent",   "label": "Claude agent",     "group": "engine"},
        ],
        "edges": [
            {"from": "sap",    "to": "ft"},
            {"from": "ft",     "to": "bronze"},
            {"from": "bronze", "to": "silver"},
            {"from": "silver", "to": "gold"},
            {"from": "gold",   "to": "athena"},
            {"from": "gold",   "to": "duckdb"},
            {"from": "gold",   "to": "spark"},
            {"from": "gold",   "to": "agent"},
        ],
    }
    return {"tables": tables, "engines": engines, "lineage": lineage,
            "mds_vs_odi": [
                {"dimension": "Storage",        "sap_bw": "SAP-managed columnstore",     "odi": "Open Iceberg in your S3"},
                {"dimension": "Compute",        "sap_bw": "SAP HANA / Datasphere only",  "odi": "Athena, DuckDB, Trino, Spark, anything"},
                {"dimension": "AI access",      "sap_bw": "Via SAP-controlled pathways", "odi": "Direct parquet read; no RFC"},
                {"dimension": "Migration cost", "sap_bw": "Full rebuild",                "odi": "Portable dbt SQL"},
                {"dimension": "Vendor lock-in", "sap_bw": "End-to-end",                  "odi": "None"},
            ]}


def shape_pipeline(d: dict[str, Any]) -> dict[str, Any]:
    return {
        "connector_status": {
            "name": "SAP S/4HANA (SLT)", "state": "healthy",
            "last_sync_at": datetime(2026, 5, 20, 14, 22).isoformat() + "Z",
            "sync_frequency_min": 15, "tables_replicated": 16,
        },
        "layer_status": [
            {"layer": "bronze",  "state": "healthy", "rows": sum(_table_row_counts(d).values()), "last_run": "2026-05-20T14:22Z"},
            {"layer": "silver",  "state": "healthy", "rows": len(d["gl_journal"]) + len(d["sales_orders"]) + len(d["purchase_orders"]), "last_run": "2026-05-20T14:32Z"},
            {"layer": "gold",    "state": "healthy", "rows": len(d["invoices"]) + len(d["supplier_invoices"]),                          "last_run": "2026-05-20T14:38Z"},
            {"layer": "publish", "state": "healthy", "rows": None,                                                                       "last_run": "2026-05-20T14:40Z"},
        ],
        "failure_sim": [
            {"id": "odp_rfc_blocked",
             "title": "ODP RFC blocking (July 2026)",
             "narrative": "If Keystone had used ODP RFC, the source connector would have failed starting July 2026. Our SLT path is unaffected — this is the architecture decision the policy forced." ,
             "would_impact": False},
            {"id": "sap_credentials_rotated",
             "title": "SLT credentials rotated",
             "narrative": "Fivetran retries with the new credential after Slab updates the secret.",
             "would_impact": True},
            {"id": "iceberg_schema_evolved",
             "title": "Iceberg schema evolved",
             "narrative": "Adding a column to KNA1 propagates through bronze → silver → gold without rewriting queries.",
             "would_impact": False},
        ],
    }


def _table_row_counts(d: dict[str, Any]) -> dict[str, int]:
    return {
        "bkpf": len({r["document_number"] for r in d["gl_journal"]}),
        "bseg": len(d["gl_journal"]),
        "vbak": len({so["sales_doc_id"] for so in d["sales_orders"]}),
        "vbap": len(d["sales_orders"]),
        "vbrk": len({i["billing_doc_id"] for i in d["invoices"]}),
        "vbrp": len(d["invoices"]),
        "ekko": len({p["purchase_order_id"] for p in d["purchase_orders"]}),
        "ekpo": len(d["purchase_orders"]),
        "rseg": len(d["supplier_invoices"]),
        "mara": len(d["materials"]),
    }


def shape_policy_risk_map() -> list[dict[str, str]]:
    return [
        {"risk":  "Cost stacking",
         "claim": "Multiple SAP data products compound expenses when external compute joins the architecture.",
         "answer": "Single Iceberg copy. Athena, DuckDB, Trino, Spark — every engine reads the same bytes.",
         "link":   "/architecture#engines",
         "link_label": "Five engines, one storage copy"},
        {"risk":  "Cloud inflexibility",
         "claim": "Restricted to vendor-certified services rather than the full native cloud catalog.",
         "answer": "Native S3 + Glue + Athena. Terraform under infra/ provisions exactly the AWS primitives Keystone already runs.",
         "link":   "/architecture#infra",
         "link_label": "Open Iceberg in your own S3"},
        {"risk":  "Architectural lock-in",
         "claim": "Business logic and security models stay vendor-dependent; migrations are full rebuilds.",
         "answer": "Marts live as portable dbt SQL. Swap Athena for Snowflake or BigQuery without rewriting the business logic.",
         "link":   "/finance",
         "link_label": "Marts are portable dbt SQL"},
        {"risk":  "AI dependency",
         "claim": "AI agent access to your own data is limited to vendor-defined pathways.",
         "answer": "Claude queries the lake directly. No SAP RFC. No SAP-licensed analytical compute. No policy violation.",
         "link":   "/agent",
         "link_label": "Claude queries the lake directly"},
    ]


def shape_agent() -> dict[str, Any]:
    return {
        "sample_questions": [
            "Which customers have the worst DSO this quarter?",
            "Which vendors are below 90% three-way-match?",
            "Show me the top 10 slow-moving materials by inventory value.",
            "What does the trial balance look like for KS01 in Q1?",
            "Which sales orders have been open more than 60 days?",
        ],
        "policy_callouts": [
            "This agent never calls an SAP API.",
            "It queries the Iceberg gold layer directly via the Glue catalog.",
            "The same query path works against DuckDB on a laptop, Athena in production, or Spark in batch.",
            "No ODP RFC. No SAP-controlled gateway. No exposure to the July 2026 deadline.",
        ],
    }
