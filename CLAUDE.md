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
