#!/bin/sh
set -eu

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
dockerfile="$repo_root/Dockerfile.preview"
dockerignore="$repo_root/.dockerignore"

[ -f "$dockerfile" ]
# An untrusted PR must not be able to add a dotenv file to the Docker context.
grep -Fqx '.env' "$dockerignore"

grep -Fqx 'ARG APP_ORIGIN=https://preview.development.bottle-note.com' "$dockerfile"
grep -Fqx 'ARG INTERNAL_SERVER_URL=http://product-api' "$dockerfile"
grep -Fqx 'ENV NEXT_PUBLIC_CLIENT_URL=$APP_ORIGIN' "$dockerfile"
grep -Fqx 'ENV NEXTAUTH_URL=$APP_ORIGIN' "$dockerfile"
grep -Fqx 'ENV CLIENT_URL=$APP_ORIGIN' "$dockerfile"
grep -Fqx 'ENV INTERNAL_SERVER_URL=$INTERNAL_SERVER_URL' "$dockerfile"
grep -Fqx 'CMD ["node", "server.js"]' "$dockerfile"
! grep -Eq 'sops[[:space:]]+-d|SOPS_AGE_KEY|\.sops\.env' "$dockerfile"

printf '%s\n' 'preview container configuration checks passed'
