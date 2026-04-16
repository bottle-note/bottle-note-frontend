# Bottle Note Frontend

위스키 리뷰 및 평가 플랫폼 프론트엔드

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **UI**: React 18, Tailwind CSS
- **상태 관리**:
  - 서버 상태: TanStack Query v5
  - 클라이언트 상태: Zustand v4
- **폼**: React Hook Form + Yup
- **인증**: NextAuth.js
- **패키지 매니저**: pnpm

## 폴더 구조

```
src/
├── app/           # Next.js App Router 페이지
│   ├── (custom)/  # 커스텀 레이아웃 (로그인, OAuth 등)
│   └── (primary)/ # 메인 레이아웃 (설정, 프로필 등)
├── components/    # 재사용 가능한 UI 컴포넌트
├── hooks/         # 커스텀 React 훅
├── lib/           # 라이브러리 설정 (API 클라이언트 등)
├── queries/       # TanStack Query 관련
├── store/         # Zustand 스토어
├── types/         # TypeScript 타입 정의
├── utils/         # 유틸리티 함수
└── constants/     # 상수 정의
```

## 주요 스크립트

```bash
pnpm dev           # 개발 서버 (dev 환경)
pnpm dev:local     # 개발 서버 (local 환경)
pnpm build:dev     # 빌드 (dev 환경)
pnpm build:prod    # 빌드 (prod 환경)
pnpm test          # Jest 테스트 실행
pnpm lint          # ESLint 검사
pnpm lint:fix      # ESLint 자동 수정
```

## 코드 컨벤션

### Import 순서 (ESLint로 강제)

1. builtin (react, next)
2. external 패키지
3. internal (pages, components, hooks, types, utils, store, constants)
4. 상대 경로

### 스타일 가이드

- Prettier 사용 (endOfLine: auto)
- 함수형 컴포넌트 사용
- console.warn, console.error만 허용 (console.log 금지)
- props spreading 허용
- 한국어 주석 가능

## 환경변수

환경변수는 git submodule로 관리됩니다:

- `.env.local` - 로컬 개발
- `.env.development` - 개발 서버
- `.env.production` - 프로덕션

설정 방법:

```bash
pnpm run setenv:local  # .env.local 설정
pnpm run setenv:dev    # .env.development 설정
```

## Figma MCP 사용 규칙

### DESIGN.md 참조 필수
UI 컴포넌트를 생성하거나 수정할 때 반드시 프로젝트 루트의 `DESIGN.md`를 먼저 읽고, 정의된 디자인 토큰과 컴포넌트 패턴을 따른다.

### MCP 호출 순서 (결정론적 5단계)
Figma MCP를 사용할 때 반드시 아래 순서를 따른다. 순서를 건너뛰거나 임의 호출하지 않는다.

1. `get_metadata` — 레이아웃 계층 구조 파악 (필수, 1회)
2. `get_screenshot` — 시각적 의도 확인 (선택, 복잡한 화면만)
3. `get_code_connect` — 기존 컴포넌트 매핑 확인
4. `get_variable_defs` — 디자인 토큰 (color, spacing, typography)
5. 코드 생성 — 위 컨텍스트 기반으로 구현

### 호출 제한
- 한 화면당 최대 **5회** MCP tool 호출
- 동일 tool 연속 재시도 금지 — 에러 시 다음 단계로 진행
- `get_screenshot`는 토큰 소비가 가장 크므로 꼭 필요한 경우만 사용
- 이미 로컬에 export된 JSON/PNG가 있으면 MCP 대신 로컬 파일 우선 참조

### 코드 생성 규칙
- hex 값 하드코딩 금지 — `tailwind.config.ts`에 정의된 색상 토큰 또는 CSS 변수 사용
- 새 컴포넌트를 만들기 전에 `src/components/`의 기존 컴포넌트 재사용 가능 여부 확인
- Figma Auto Layout → Tailwind flex/grid 매핑, Figma spacing → Tailwind spacing 토큰 매핑

## 개발 가이드

### 새 컴포넌트 생성 시

1. `src/components/` 또는 해당 페이지의 `_components/` 폴더에 생성
2. TypeScript 타입 명시
3. Tailwind CSS로 스타일링

### API 호출 시

1. TanStack Query 사용 (useQuery, useMutation)
2. `src/api/{domain}/{domain}.api.ts`에 API 함수 정의
3. `src/queries/`에 query/mutation 훅 정의

### API 모듈 규칙 (중요)

**배럴 파일(index.ts) 사용 금지** - 번들링과 트리셰이킹 최적화를 위해 직접 파일 경로 사용

```
src/api/
├── _shared/
│   ├── types.ts           # ApiResponse 등 공통 타입
│   └── queryBuilder.ts    # 쿼리 파라미터 빌더
├── {domain}/
│   ├── {domain}.api.ts    # API 함수 (예: alcohol.api.ts)
│   └── types.ts           # 도메인별 타입
```

**Import 규칙:**

```tsx
// ✅ 올바른 방식 - 직접 파일 경로
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import type { Alcohol } from '@/api/alcohol/types';

// ❌ 금지 - 배럴 파일 import
import { AlcoholsApi, Alcohol } from '@/api/alcohol';
```

**API 함수 규칙:**

- 모든 API 함수는 `ApiResponse<T>` 타입 반환
- 사용 시 `response.data`로 실제 데이터 접근
- `authRequired` 옵션 항상 명시

### 신규 의존성 도입 시 (중요)

새 패키지를 설치하기 전에 반드시 아래 체크리스트를 검토하고, 사용자에게 근거를 제시한 뒤 승인을 받아야 한다.

1. **도입 근거**: 왜 필요한지, 직접 구현 대비 이점은 무엇인지
2. **대안 비교**: 기존 의존성으로 해결 가능한지, 동일 역할의 다른 라이브러리는 없는지
3. **번들 영향**: gzip 사이즈, tree-shaking 지원 여부
4. **유지보수 상태**: 마지막 릴리스 시점, GitHub 이슈 대응, 주간 다운로드 수
5. **생태계 호환**: 기존 라이브러리의 공식 플러그인인지, 독립 라이브러리인지

승인 없이 `pnpm add`를 실행하지 않는다.

### 전역 상태 관리 시

1. Zustand 스토어 사용 (`src/store/`)
2. 서버 상태는 TanStack Query로 관리

---

## 코드 패턴 예시

### 커스텀 훅 패턴

```tsx
// src/hooks/useXxx.ts
import { useState, useCallback, useRef } from 'react';

interface Options {
  // 옵션 타입 정의
}

export const useXxx = (options?: Options) => {
  const [state, setState] = useState<Type>(initialValue);
  const ref = useRef<NodeJS.Timeout | null>(null);

  const action = useCallback((params: ParamType) => {
    // 로직 구현
  }, []);

  return { state, action };
};
```

### Zustand 스토어 패턴

```tsx
// src/store/xxxStore.ts
import { create } from 'zustand';

interface XxxState {
  value: string;
  isOpen: boolean;
}

interface XxxStore {
  state: XxxState;
  handleState: (newState: Partial<XxxState>) => void;
  handleReset: () => void;
}

const initialState: XxxState = {
  value: '',
  isOpen: false,
};

const useXxxStore = create<XxxStore>((set) => ({
  state: initialState,
  handleState: (newState) =>
    set((prev) => ({
      state: { ...prev.state, ...newState },
    })),
  handleReset: () => set({ state: initialState }),
}));

export default useXxxStore;
```

### 컴포넌트 패턴

```tsx
// src/components/Xxx.tsx 또는 _components/Xxx.tsx
interface Props {
  title: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function Xxx({ title, onClick, children }: Props) {
  return (
    <div className="flex items-center gap-2">
      <h2 className="text-lg font-bold">{title}</h2>
      {children}
      {onClick && (
        <button onClick={onClick} className="px-4 py-2 bg-primary rounded">
          Click
        </button>
      )}
    </div>
  );
}
```

### 무한 스크롤 패턴

```tsx
// IntersectionObserver 기반
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

function List() {
  const { data, fetchNextPage } = useInfiniteQuery(...);
  const { targetRef } = useInfiniteScroll({ fetchNextPage });

  return (
    <div>
      {data?.pages.map((page) =>
        page.items.map((item) => <Item key={item.id} {...item} />)
      )}
      <div ref={targetRef} /> {/* 스크롤 감지 타겟 */}
    </div>
  );
}
```

### 모달 사용 패턴

```tsx
import useModalStore from '@/store/modalStore';

function Component() {
  const { handleModalState } = useModalStore();

  const showAlert = () => {
    handleModalState({
      isShowModal: true,
      type: 'ALERT',
      mainText: '알림 메시지',
      subText: '상세 설명',
    });
  };

  const showConfirm = () => {
    handleModalState({
      isShowModal: true,
      type: 'CONFIRM',
      mainText: '확인하시겠습니까?',
      handleConfirm: () => {
        /* 확인 시 동작 */
      },
      handleCancel: () => {
        /* 취소 시 동작 */
      },
    });
  };
}
```
