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
2. `src/lib/`에 API 클라이언트 정의
3. `src/queries/`에 query/mutation 훅 정의

### 전역 상태 관리 시
1. Zustand 스토어 사용 (`src/store/`)
2. 서버 상태는 TanStack Query로 관리
