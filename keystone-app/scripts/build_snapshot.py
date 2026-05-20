"""
Build the JSON snapshot the Keystone frontend reads.

With AWS credentials in the env (AWS_REGION, LAKE_BUCKET, ATHENA_WORKGROUP),
this would query the dbt gold layer via Athena. Without them, it falls back
to the deterministic synthetic generator in _synthetic.py.

Run from the keystone-app/ directory:

    python scripts/build_snapshot.py
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

REPO_ROOT     = Path(__file__).resolve().parent.parent
OUTPUT_DIR    = REPO_ROOT / "frontend" / "public" / "data"
SCRIPTS_DIR   = REPO_ROOT / "scripts"

sys.path.insert(0, str(SCRIPTS_DIR))
import _synthetic as syn  # noqa: E402


def use_athena() -> bool:
    return all(os.environ.get(k) for k in ("AWS_REGION", "LAKE_BUCKET", "ATHENA_WORKGROUP"))


def _write(name: str, payload) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUTPUT_DIR / name
    out.write_text(json.dumps(payload, indent=2, default=str))
    print(f"  wrote {out.relative_to(REPO_ROOT)}  ({out.stat().st_size:,} bytes)")


def main() -> None:
    if use_athena():
        print("AWS credentials detected — Athena path would run here.")
        print("(Not yet wired; falling back to synthetic for this snapshot.)")
    else:
        print("No AWS credentials — using deterministic synthetic generator.")

    print("Generating dataset...")
    d = syn.generate()

    print("Shaping snapshot files...")
    _write("summary.json",          syn.shape_summary(d))
    _write("finance.json",          syn.shape_finance(d))
    _write("o2c.json",              syn.shape_o2c(d))
    _write("p2p.json",              syn.shape_p2p(d))
    _write("inventory.json",        syn.shape_inventory(d))
    _write("iceberg.json",          syn.shape_iceberg(d))
    _write("pipeline.json",         syn.shape_pipeline(d))
    _write("agent.json",            syn.shape_agent())
    _write("policy_risk_map.json",  syn.shape_policy_risk_map())

    print("Done.")


if __name__ == "__main__":
    main()
