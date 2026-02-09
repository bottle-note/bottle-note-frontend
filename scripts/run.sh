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

# local 환경에서만 서브모듈 초기화 및 환경변수 자동 세팅
# dev/prod는 CI에서 별도로 env를 관리하므로 건너뜀
if [ "$ENV" = "local" ]; then
  if [ ! -f "$SOPS_FILE" ]; then
    echo "📦 Initializing git submodule..."
    git submodule update --init --remote
  fi

  if [ ! -f "$ENV_FILE" ] || [ "$SOPS_FILE" -nt "$ENV_FILE" ]; then
    echo "🔐 Decrypting $ENV environment..."
    sops -d "$SOPS_FILE" > "$ENV_FILE"
  fi
fi

# env 파일 존재 확인
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ $ENV_FILE not found. Set up environment variables first."
  exit 1
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
