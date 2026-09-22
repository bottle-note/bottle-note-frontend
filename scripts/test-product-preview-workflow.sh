#!/bin/sh
set -eu

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
workflow="$repo_root/.github/workflows/product-preview-deploy.yml"

[ -f "$workflow" ]
grep -Fqx '  pull_request_target:' "$workflow"
grep -Fqx '    types: [labeled, synchronize, reopened]' "$workflow"
grep -Fqx '    branches: [main]' "$workflow"
grep -Fqx '  group: product-preview-deploy' "$workflow"
grep -Fqx '  cancel-in-progress: true' "$workflow"
grep -Fq "github.event.pull_request.head.repo.full_name == github.repository" "$workflow"
grep -Fq "github.event.label.name == 'preview-deploy'" "$workflow"
grep -Fq "ref: main" "$workflow"
grep -Fq "path: .trusted" "$workflow"
grep -Fq "submodules: true" "$workflow"
grep -Fq "ref: \${{ github.event.pull_request.head.sha }}" "$workflow"
grep -Fq "path: .source" "$workflow"
grep -Fq "submodules: false" "$workflow"
grep -Fq "persist-credentials: false" "$workflow"
grep -Fq 'uses: bottle-note/bottle-note-frontend/.github/actions/docker-build-push@2f676cc70abc64f87bb5486115560f30c63d6fe9' "$workflow"
! grep -Eq 'uses: (actions|docker|sigstore)/[^@]+@v[0-9]' "$workflow"
[ "$(grep -c 'pulls.get' "$workflow")" -ge 2 ]
grep -Fq 'IMAGE_NAME: bottlenote-frontend-preview' "$workflow"
grep -Fq 'image-name: ${{ env.IMAGE_NAME }}' "$workflow"
grep -Fq 'context: .source' "$workflow"
grep -Fq 'dockerfile: .source/Dockerfile.preview' "$workflow"
grep -Fq 'image-tag: frontend_preview_pr-${{ github.event.pull_request.number }}_${{ needs.prepare.outputs.short-sha }}' "$workflow"
! grep -Fq 'promote-tags:' "$workflow"
grep -Fq 'verify live preview ownership' "$workflow"
grep -Fq 'docker buildx imagetools create --tag "${IMAGE}:${PREVIEW_CHANNEL_TAG}"' "$workflow"
grep -Fq 'sops-age-key: preview-build-has-no-sops-secret' "$workflow"
grep -Fq 'APP_ORIGIN=https://preview.development.bottle-note.com' "$workflow"
grep -Fq 'INTERNAL_SERVER_URL=http://product-api' "$workflow"
! grep -Fq 'NEXT_PUBLIC_IS_PREVIEW' "$workflow"
! grep -Fq 'SOPS_AGE_SECRET_KEY' "$workflow"

printf '%s\n' 'product preview workflow checks passed'
