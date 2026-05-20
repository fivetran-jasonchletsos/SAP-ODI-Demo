#!/usr/bin/env bash
# Bootstrap script for the SAP-ODI-Demo (Keystone Industries).
# Run from the repo root.

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> Python venv"
python3 -m venv "$REPO/.venv"
# shellcheck disable=SC1091
source "$REPO/.venv/bin/activate"
pip install --upgrade pip
pip install -r "$REPO/requirements.txt"

echo "==> Synthetic snapshot"
( cd "$REPO/keystone-app" && python scripts/build_snapshot.py )

echo "==> Frontend"
( cd "$REPO/keystone-app/frontend" && npm install --silent )

cat <<'EOF'

Setup complete.

Run the demo:
  cd keystone-app/frontend && npm run dev

Optional — provision AWS:
  cd infra
  cp terraform.tfvars.example terraform.tfvars
  # fill in fivetran_external_id and dbt_iam_user_arn
  terraform init && terraform apply

Optional — run dbt against Athena (after terraform apply):
  cd transform
  cp profiles.yml.example profiles.yml
  export AWS_REGION=us-east-1
  export LAKE_BUCKET=$(cd ../infra && terraform output -raw lake_bucket)
  export ATHENA_WORKGROUP=keystone_odi
  dbt deps && dbt build

EOF
