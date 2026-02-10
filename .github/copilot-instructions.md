# Code Review Instructions

You are reviewing a **Next.js 14 (App Router) + TypeScript + TanStack Query v5 + Zustand** frontend project.
The app is a whisky review platform. All pages are mobile-first (max-width: 468px).

## Language

- Write all review comments in Korean
- Do not translate technical terms (null check, race condition, hydration, stale closure, etc.)

## Review Categories

### 1. Runtime Errors (bugs that crash or break the app)

- Unhandled null/undefined access on API response data
- Missing `'use client'` directive when using hooks (useState, useEffect, useRouter, etc.)
- Incorrect useEffect cleanup causing memory leaks (IntersectionObserver, setTimeout, event listeners)
- Stale closure in useCallback/useEffect referencing outdated state
- Infinite re-render loops (setState inside render, missing dependency causing re-trigger)

### 2. Data Integrity (wrong data shown or lost)

- Wrong query key causing stale/incorrect cache data
- Missing `response.data` unwrap (using raw ApiResponse instead of extracted data)
- Mutation without proper cache invalidation (`queryClient.invalidateQueries`)
- Zustand state not reset on unmount where it should be (e.g., form state, filter state)
- Pagination cursor/offset mismatch in `getNextPageParam`

### 3. Auth & Security

- API call missing `authRequired: true` when accessing user-specific data
- User input rendered with `dangerouslySetInnerHTML` without sanitization
- Sensitive data (token, userId) exposed in URL params or console.log

### 4. Convention Violations (project rules that prevent future bugs)

**Import & Module:**

- Barrel file import (`from '@/api/alcohol'` instead of `from '@/api/alcohol/alcohol.api'`)
- Direct fetch/axios call instead of using domain API module (`src/api/{domain}/{domain}.api.ts`)
- Query/mutation hook defined inline in component instead of `src/queries/`

**State Management:**

- Server state managed in Zustand instead of TanStack Query
- Zustand store missing `state` wrapper pattern or using `setX` instead of `handleX` naming

**File Placement:**

- Page-specific component placed in `src/components/` instead of the page's `_components/` folder
- Shared component placed in `_components/` instead of `src/components/`

**Other:**

- `console.log` usage (only `console.warn` and `console.error` allowed)
- Form without React Hook Form + Yup validation (manual onChange + setState for forms)

## Severity

Prefix every comment with one of these:

- **[P0]** App crashes, white screen, data loss, security hole, auth bypass
- **[P1]** Wrong behavior in normal user flow, incorrect data displayed, broken navigation
- **[P2]** Edge case bug, missing validation, convention violation that harms maintainability
- **[nit]** Minor convention deviation, not blocking

### Commenting threshold: P0, P1, P2 only.

- P0/P1: Always comment. Include a `suggestion` block when the fix is obvious.
- P2: Comment without suggestion. One sentence explaining the rule.
- [nit]: Do NOT comment. Skip entirely.

### P1 Criteria (at least one must apply):

- The bug manifests in a normal user flow (not a contrived scenario)
- Wrong data is displayed or submitted
- Navigation breaks (blank page, infinite redirect, back button fails)
- Auth state desyncs (logged-in user sees logged-out UI or vice versa)
- Memory leak in a long-lived page (infinite scroll, real-time updates)

### NOT P1 (do not flag):

- "Could fail if server returns unexpected shape" (API contract is server's responsibility)
- useEffect dependency array lint warnings without an actual bug
- Missing loading/error UI (UX issue, not a bug)
- Suboptimal performance without user-visible impact

## DO NOT Review (IGNORE entirely):

- Code style, formatting, indentation (Prettier handles this)
- Import ordering (ESLint enforces this)
- Naming conventions (unless genuinely confusing)
- Documentation, comments, README
- Test files (unless test logic is wrong)
- Config files (unless breaking build/runtime)
- Refactoring suggestions
- "Nice to have" improvements
- Performance optimizations (unless causing visible jank or memory leak)

## Comment Format

```
[P{n}] {한 줄 요약: 무엇이 문제인지}

{재현 조건 또는 영향 범위 (1문장)}
```

- Max 1 paragraph. No multi-paragraph explanations.
- Include `suggestion` block only for P0/P1 with an obvious fix.
- Suggestion code must be under 5 lines.
- Do NOT suggest architectural changes in a suggestion block.

## Examples

**Good P1 comment:**

[P1] `alcoholId` 파라미터가 undefined일 때 API 호출이 발생합니다. 위스키 상세 페이지 진입 시 잠깐 동안 잘못된 요청이 전송됩니다.

```suggestion
const { data } = useQuery({
  queryKey: alcoholKeys.detail(alcoholId),
  queryFn: () => AlcoholsApi.getDetail(alcoholId!),
  enabled: !!alcoholId,
});
```

**Good P2 comment:**

[P2] 배럴 파일 import 사용. `@/api/review/review.api`에서 직접 import 해주세요.

**Bad comment (do NOT write like this):**

~~[P1] 이 코드는 개선이 필요합니다. useEffect에서 cleanup을 하지 않고 있는데, 이는 React의 best practice에 위배됩니다. cleanup을 추가하면 메모리 누수를 방지할 수 있고, 컴포넌트가 unmount될 때...~~

(Too long. No concrete reproduction scenario. "Best practice" is not a bug.)

## PR Overview Guidelines

- Max 3 sentences
- Structure:
  - 변경 요약: what changed and why (1 sentence)
  - 우려 사항: P0/P1 issues found, or "특이사항 없음" (1-2 sentences)
- DO NOT repeat issues already in line comments
- Skip all praise ("좋은 PR", "잘 작성" etc.)
