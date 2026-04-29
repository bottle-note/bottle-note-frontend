# Bottle Note 디자인 시스템

위스키 리뷰 플랫폼의 디자인 토큰, 컴포넌트 패턴, 레이아웃 원칙을 정의한다.
AI 에이전트가 UI 컴포넌트를 생성·수정할 때 이 문서를 **먼저** 읽고 따른다.

---

## 1. Visual Theme & Atmosphere

**플랫폼 성격:** 위스키 리뷰 및 평가 — 따뜻하고 절제된 코럴 톤, 어두운 배경 위 텍스처감 있는 콘텐츠 카드.

**주요 감성 키워드:**
- 따뜻함 (Warm coral accent)
- 절제 (Minimal chrome, content-first)
- 모바일 몰입 (Full-height, edge-to-edge layout)
- 위스키 감성 (차분한 회색 계열 + 코럴 포인트)

---

## 2. Color Palette & Roles

### 브랜드 컬러 (tailwind.config.ts `tailwindColors`)

| 토큰명 | hex | 용도 |
|---|---|---|
| `mainCoral` | `#EF9A6E` | 주요 액센트, 강조 포인트 |
| `subCoral` | `#E58257` | 라벨/탭 활성 상태, 버튼, 모달 헤딩 |
| `bgGray` | `#E6E6DD` | 비활성 라벨 배경 |
| `brightGray` | `#BFBFBF` | 보조 UI 요소 |
| `mainGray` | `#666666` | 보조 텍스트 |
| `textGray` | `#C6C6C6` | placeholder, 비활성 텍스트 |
| `gray` | `#2B2B2B` | 일반 텍스트 |
| `mainBlack` | `#101010` | 최상위 텍스트 |
| `mainDarkGray` | `#252525` | 모달 본문 텍스트 |
| `sectionWhite` | `#F7F7F7` | 섹션 배경 |

### 시맨틱 컬러 (CSS 변수, `globals.css`)

라이트 모드 기준 (`hsl(var(--token))` 형태로 사용):

| CSS 변수 | HSL 값 | Tailwind 클래스 |
|---|---|---|
| `--background` | `0 0% 100%` | `bg-background` |
| `--foreground` | `0 0% 3.9%` | `text-foreground` |
| `--primary` | `0 0% 9%` | `bg-primary`, `text-primary` |
| `--primary-foreground` | `0 0% 98%` | `text-primary-foreground` |
| `--secondary` | `0 0% 96.1%` | `bg-secondary` |
| `--muted` | `0 0% 96.1%` | `bg-muted` |
| `--muted-foreground` | `0 0% 45.1%` | `text-muted-foreground` |
| `--border` | `0 0% 89.8%` | `border-border` |
| `--destructive` | `0 84.2% 60.2%` | `text-destructive` |
| `--radius` | `0.5rem` | `rounded-lg`, `rounded-md`, `rounded-sm` |

다크 모드 토큰은 `.dark` 클래스에서 오버라이드된다.

---

## 3. Typography Rules

### 폰트 패밀리

| 용도 | 폰트 | 적용 방식 |
|---|---|---|
| 기본 본문 | SUIT (100~900) | `body { font-family: 'Suit', sans-serif }` |
| 입력 필드 (`input`, `textarea`) | Noto Sans | CSS layer base에서 자동 적용 |

### 크기 스케일 (tailwind.config.ts `fontSize`)

| Tailwind 클래스 | font-size / line-height |
|---|---|
| `text-9` | 9px / 9px |
| `text-10` | 10px / 14px |
| `text-11` | 11px / 15px |
| `text-12` | 12px / 16px |
| `text-13` | 13px / 17px |
| `text-13.5` | 13.5px / 17.5px |
| `text-14` | 14px / 18px |
| `text-15` | 15px / 19px |
| `text-16` | 16px / 20px |
| `text-20` | 20px / 24px |
| `text-24` | 24px / 28px |
| `text-27` | 27px / 31px |

> 위 클래스 외 임의 font-size 사용 금지. 가장 가까운 스케일을 사용한다.

---

## 4. Component Stylings

### 라벨 (`.label-*`)

```
.label-default   → bg-white text-subCoral border border-subCoral rounded-md py-1 px-3
.label-selected  → bg-subCoral text-white border border-subCoral rounded-md py-1 px-3
.label-disabled  → bg-bgGray text-white border border-bgGray rounded-md py-1 px-3
```

### 탭 (`.tab-*`)

```
.tab-default  → text-subCoral/50 border-subCoral/50 border-b
.tab-selected → text-subCoral border-subCoral border-b
```

### 모달 텍스트

```
.modal-mainText → text-20 text-subCoral font-medium whitespace-pre-wrap mb-2
.modal-subText  → text-16 text-mainDarkGray whitespace-pre-wrap mb-3
```

모달 트리거는 `useModalStore` (`src/store/modalStore`)의 `handleModalState`를 사용한다.

### 레이아웃 컨테이너

```
.fixed-content     → fixed left-0 right-0 max-w-content mx-auto
.content-container → max-w-content mx-auto w-full
```

### 버튼 패턴

- 주요 액션 버튼: `bg-subCoral text-white`
- 비활성: `bg-bgGray text-white`
- 아웃라인: `border border-subCoral text-subCoral bg-white`

---

## 5. Layout Principles

### 컨테이너

- `max-w-content` = `468px` — 모든 콘텐츠의 최대 너비
- 항상 `mx-auto`로 중앙 정렬
- 좌우 패딩: 보통 `px-4` (16px) 또는 `px-5` (20px)

### Safe Area (iOS/Android 대응)

| CSS 변수 | 값 | 설명 |
|---|---|---|
| `--safe-area-top` | `max(env(safe-area-inset-top), var(--android-safe-area-top))` | 상단 안전 영역 |
| `--safe-area-bottom` | `max(env(safe-area-inset-bottom), var(--android-safe-area-bottom))` | 하단 안전 영역 |
| `--header-height` | `20px` | 기본 헤더 높이 |
| `--header-height-with-safe` | `calc(20px + safe-area-top)` | safe area 포함 헤더 |
| `--navbar-height` | `70px` | 하단 네비게이션 바 |
| `--tab-height` | `81px` | 탭 영역 높이 |
| `--search-bar-height` | `56px` | 검색 바 높이 |

### Safe Area 유틸리티 클래스

```
.pt-safe         → padding-top: var(--safe-area-top)
.pt-safe-header  → padding-top: var(--header-height-with-safe)
.pb-safe         → padding-bottom: max(32px, env(safe-area-inset-bottom))
.pb-safe-lg      → padding-bottom: max(64px, env(safe-area-inset-bottom) + 32px)
.pb-navbar       → padding-bottom: var(--navbar-total-space)
```

페이지 최상단에는 반드시 `.pt-safe-header` 또는 `.pt-safe` 적용. 네비게이션 바 아래 콘텐츠에는 `.pb-navbar` 적용.

---

## 6. Depth & Elevation

### Border Radius

| Tailwind 클래스 | 값 |
|---|---|
| `rounded-lg` | `var(--radius)` = 0.5rem |
| `rounded-md` | `calc(var(--radius) - 2px)` = ~0.375rem |
| `rounded-sm` | `calc(var(--radius) - 4px)` = ~0.25rem |
| `rounded-full` | 9999px (아바타, 아이콘 버튼) |

### Shadow

프로젝트에 별도 shadow 토큰 없음. 필요 시 Tailwind 기본 `shadow-sm`, `shadow-md` 사용. 남용 금지.

---

## 7. Do's and Don'ts

### Do

- 컬러는 반드시 `tailwindColors` 토큰 또는 CSS 변수(`hsl(var(--token))`) 사용
- 새 컴포넌트 전에 `src/components/`의 기존 컴포넌트 재사용 가능 여부 확인
- Figma Auto Layout → Tailwind `flex`/`grid` 매핑
- Figma spacing 값 → 가장 가까운 Tailwind spacing 토큰 매핑
- 입력 필드에는 Noto Sans 폰트가 자동 적용됨 (별도 지정 불필요)
- 모달은 `useModalStore.handleModalState` 패턴 사용

### Don't

- hex 값 하드코딩 금지 (`text-[#E58257]` 형태 금지 — `text-subCoral` 사용)
- 임의 font-size 금지 (스케일 외 크기 사용 시 PM 확인)
- `console.log` 사용 금지 (`console.warn`, `console.error`만 허용)
- 배럴 파일(`index.ts`) import 금지
- 신규 의존성 도입 전 승인 필수 (CLAUDE.md 참조)

---

## 8. Responsive Behavior

보틀노트는 **모바일 퍼스트** 단일 너비 레이아웃이다.

- 목표 기기: iOS Safari, Android WebView (인앱 브라우저)
- 데스크탑: 중앙 468px 고정, 양 옆 여백
- 브레이크포인트 미사용 — 반응형 분기 불필요
- `100dvh` 사용 (`min-h-safe-screen`) — iOS 주소창 높이 변동 대응
- 스크롤바 전역 숨김 처리됨 (`::-webkit-scrollbar { display: none }`)
- 텍스트 선택/드래그 전역 비활성화 (`user-select: none`) — `input`/`textarea` 제외

---

## 9. Agent Quick Reference

Figma에서 컴포넌트를 생성할 때 아래 테이블을 즉시 참조한다.

### 핵심 컬러 토큰

| 용도 | Tailwind 클래스 |
|---|---|
| 주요 액센트 | `text-mainCoral` / `bg-mainCoral` |
| 버튼/탭 활성 | `text-subCoral` / `bg-subCoral` |
| 비활성 배경 | `bg-bgGray` |
| 기본 텍스트 | `text-gray` (`#2B2B2B`) |
| 강조 텍스트 | `text-mainBlack` |
| 보조 텍스트 | `text-mainGray` |
| placeholder | `text-textGray` |
| 섹션 배경 | `bg-sectionWhite` |

### 핵심 레이아웃 패턴

| 패턴 | 클래스 조합 |
|---|---|
| 페이지 래퍼 | `content-container pt-safe-header pb-navbar` |
| 고정 헤더 | `fixed-content top-0 z-header pt-safe bg-white` |
| 고정 하단 버튼 | `fixed-content bottom-0 pb-safe px-4` |
| 카드 | `bg-white rounded-lg shadow-sm p-4` |
| 전체 너비 입력 | `w-full border border-border rounded-md px-3 py-2` |

### MCP 호출 체크리스트 (5단계)

```
[ ] 1. get_metadata      — 레이아웃 계층 파악
[ ] 2. get_screenshot    — 시각 확인 (복잡한 화면만)
[ ] 3. get_code_connect  — 기존 컴포넌트 매핑
[ ] 4. get_variable_defs — 토큰 확인
[ ] 5. 코드 생성          — 위 컨텍스트 기반
```

최대 5회 호출 제한. 에러 시 재시도 금지 → 다음 단계 진행.
