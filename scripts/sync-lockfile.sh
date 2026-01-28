#!/bin/bash
# package.json 변경 시 pnpm-lock.yaml 자동 동기화
# lint-staged에서 호출됨

set -e

echo "📦 package.json 변경 감지 - lockfile 동기화 중..."

# lockfile 업데이트 (패키지 검증 포함)
if ! pnpm install --lockfile-only --ignore-scripts 2>&1; then
  echo ""
  echo "❌ lockfile 동기화 실패"
  echo "💡 패키지명이 올바른지, npm registry에 존재하는지 확인하세요"
  exit 1
fi

# lockfile이 변경되었으면 스테이징
if git diff --name-only | grep -q "pnpm-lock.yaml"; then
  git add pnpm-lock.yaml
  echo "✅ pnpm-lock.yaml 자동 스테이징 완료"
else
  echo "✅ lockfile 이미 동기화됨"
fi
