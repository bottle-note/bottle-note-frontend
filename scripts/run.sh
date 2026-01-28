#!/bin/bash

# 사용법: ./scripts/run.sh <command> <env>
# command: dev, build, start
# env: local, dev, prod

COMMAND=${1:-dev}
ENV=${2:-dev}

# 환경별 설정
case $ENV in
  local)
    SOPS_FILE="git.environment-variables/application.next-js/local.sops.env"
    ENV_FILE=".env.local"
    ;;
  dev)
    SOPS_FILE="git.environment-variables/application.next-js/dev.sops.env"
    ENV_FILE=".env.development"
    ;;
  prod)
    SOPS_FILE="git.environment-variables/application.next-js/prod.sops.env"
    ENV_FILE=".env.production"
    ;;
  *)
    echo "Unknown env: $ENV (use: local, dev, prod)"
    exit 1
    ;;
esac

# 서브모듈 초기화 (없으면)
if [ ! -f "$SOPS_FILE" ]; then
  echo "📦 Initializing git submodule..."
  git submodule update --init --remote
fi

# 환경변수 복호화 (파일이 없거나 sops 파일이 더 최신이면)
if [ ! -f "$ENV_FILE" ] || [ "$SOPS_FILE" -nt "$ENV_FILE" ]; then
  echo "🔐 Decrypting $ENV environment..."
  sops -d "$SOPS_FILE" > "$ENV_FILE"
fi

# Next.js 명령 실행
case $COMMAND in
  dev)
    npx env-cmd -f "$ENV_FILE" next dev
    ;;
  build)
    npx env-cmd -f "$ENV_FILE" next build
    ;;
  start)
    npx env-cmd -f "$ENV_FILE" next start
    ;;
  *)
    echo "Unknown command: $COMMAND (use: dev, build, start)"
    exit 1
    ;;
esac
