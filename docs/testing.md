# 테스트 실행

로그인 복귀·소셜 로그인·로그인 모달·약관·인증 통합 테스트는 Vitest로 실행한다.
기존 나머지 테스트는 Jest를 사용하며, `pnpm test`는 둘 다 실행한다.

```sh
pnpm test                # Vitest + 기존 Jest 전체
pnpm test:vitest         # Vitest 단독 실행
pnpm test:watch          # Vitest watch
pnpm test:jest           # 기존 Jest 실행
pnpm test:jest:watch     # 기존 Jest watch
```

- Vitest 테스트 파일: `*.vitest.test.ts`, `*.vitest.test.tsx`
- Jest는 위 파일을 제외하므로 같은 테스트를 두 번 실행하지 않는다.
- Vitest 테스트는 `describe`, `it`, `expect`, `vi`와 Mock 타입을 `vitest`에서 직접 import한다.
- `vitest.setup.ts`에서 DOM matcher와 테스트별 DOM 정리를 설정한다.
- Vitest 5 실행에는 Node.js 22.12 이상인 22.x, 24.x 또는 26 이상이 필요하다. CI는 Node 22를 사용한다.
- 브라우저 이동·OAuth·WebView 검증은 단위 테스트와 별개로 Playwright MCP와 실제 로그인 세션으로 확인한다.

이 변경은 기존 테스트의 실행기 전환이며, 테스트 작성 범위는 AGENTS.md를 따른다.
