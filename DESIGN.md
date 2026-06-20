# BottleNote Frontend Design Guide

이 문서는 Figma 디자인을 BottleNote Frontend 코드로 옮길 때의 기준이다. 현재 코드베이스의 `tailwind.config.ts`, `src/style/globals.css`, 기존 UI 컴포넌트 사용례를 기준으로 작성했다.

## 1. 원칙

- UI 작업 전 이 문서와 대상 화면의 기존 컴포넌트를 먼저 확인한다.
- Figma의 hex 값을 그대로 하드코딩하지 않고, 가능한 Tailwind 토큰 또는 CSS 변수로 치환한다.
- 새 컴포넌트를 만들기 전 `src/components/ui`, `src/components/feature`, 해당 route의 `_components` 재사용 가능성을 확인한다.
- 모바일 WebView 중심으로 구현한다. safe-area, 고정 헤더, 하단 네비게이션 공간을 고려한다.
- 신규 패키지는 승인 전 설치하지 않는다.

## 2. 코드베이스 기준 토큰

### 2.1 Color

`tailwind.config.ts`의 `tailwindColors`를 우선 사용한다.

| Token | Hex | 주요 용도 |
| --- | --- | --- |
| `mainCoral` | `#EF9A6E` | 검색 input border/placeholder 등 밝은 코랄 |
| `subCoral` | `#E58257` | 주요 CTA, 활성 tab, nav text/icon, label selected |
| `bgGray` | `#E6E6DD` | disabled label background |
| `brightGray` | `#BFBFBF` | 비활성 버튼, 구분선, border |
| `mainGray` | `#666666` | 보조 본문, placeholder, 설명 텍스트 |
| `textGray` | `#C6C6C6` | 옅은 텍스트 |
| `gray` | `#2B2B2B` | 진한 회색 |
| `mainBlack` | `#101010` | 기본 강조 텍스트 |
| `mainDarkGray` | `#252525` | input text, modal sub text 등 |
| `sectionWhite` | `#F7F7F7` | 섹션/카드 배경 |

CSS variable 기반 shadcn 계열 토큰도 존재한다: `background`, `foreground`, `card`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`. 단, BottleNote 고유 UI는 위 `tailwindColors`를 우선한다.

Semantic color 매핑은 현재 코드 사용례를 기준으로 아래처럼 해석한다. 실제 class는 우선 기존 Tailwind token 이름을 그대로 사용하고, 새 semantic alias를 코드에 추가하기 전까지 문서 기준으로만 활용한다.

| Semantic | Token | Hex | 기준 |
| --- | --- | --- | --- |
| `brand-primary` | `subCoral` | `#E58257` | 활성 tab/nav/label, 기본 Button, 브랜드 강조 텍스트/보더에 쓰는 핵심 코랄 |
| `brand-accent` | `mainCoral` | `#EF9A6E` | 검색 input border/placeholder, 큰 CTA surface, datepicker selected, gradient highlight에 쓰는 밝은 코랄 |
| `surface-default` | `white` | `#FFFFFF` | 기본 페이지/카드/모달 배경 |
| `surface-section` | `sectionWhite` | `#F7F7F7` | 이미지 배경, 섹션성 카드 배경 |
| `surface-muted` | `bgGray` | `#E6E6DD` | 비활성 label, 보조 surface |
| `text-primary` | `mainBlack` 또는 `mainDarkGray` | `#101010` / `#252525` | 본문/강조 텍스트. 기존 화면 맥락에 맞춰 선택 |
| `text-secondary` | `mainGray` | `#666666` | 설명, 메타, placeholder 보조 텍스트 |
| `text-tertiary` | `textGray` 또는 `brightGray` | `#C6C6C6` / `#BFBFBF` | 옅은 보조 텍스트, 비활성 표시 |
| `border-default` | `brightGray` | `#BFBFBF` | 일반 구분선/비활성 border |
| `border-brand` | `subCoral` 또는 `mainCoral` | `#E58257` / `#EF9A6E` | active/brand border는 `subCoral`, input 강조 border는 `mainCoral` 우선 |

### 2.2 Typography

- 기본 폰트: `Suit`, `sans-serif`
- `input`, `textarea`: 현재 global css에서 `Noto Sans`, `sans-serif`로 지정되어 있다.
- Tailwind 확장 font size:

| Class | Size / Line-height | 권장 용도 |
| --- | --- | --- |
| `text-9` | 9 / 9px | 매우 작은 보조 표기 |
| `text-10` | 10 / 14px | nav label, 작은 chip |
| `text-11` | 11 / 15px | 보조 메타 |
| `text-12` | 12 / 16px | 설명, helper text |
| `text-13` | 13 / 17px | 본문/label/chip |
| `text-13.5` | 13.5 / 17.5px | 중간 본문 |
| `text-14` | 14 / 18px | 일반 본문 |
| `text-15` | 15 / 19px | tab, button text |
| `text-16` | 16 / 20px | header/modal body |
| `text-20` | 20 / 24px | modal main text, section title |
| `text-24` | 24 / 28px | 큰 타이틀 |
| `text-27` | 27 / 31px | 히어로 타이틀 |

Figma 매핑 기본값:

- 13pt Figma text style은 별도 지시가 없으면 모두 `text-13 font-medium`으로 매핑한다.
- 10~12px 본문: `text-10`~`text-12` + `font-normal|font-medium`
- 14~16px 강조: `text-14`~`text-16` + `font-bold`
- 20px 이상 타이틀: `text-20|text-24|text-27` + `font-bold|font-extrabold`
- Figma의 미세한 letter spacing은 기존 토큰으로 표현하기 어려우면 우선 생략하고, 시각 차이가 크면 임시 arbitrary class 예: `tracking-[-0.02em]`를 사용한다.

### 2.3 Spacing

Tailwind 기본 spacing과 아래 확장 spacing을 사용한다.

| Class | rem | px |
| --- | --- | --- |
| `1.5` | 0.375 | 6 |
| `2.5` | 0.625 | 10 |
| `2.75` | 0.688 | 약 11 |
| `3.25` | 0.813 | 약 13 |
| `3.5` | 0.875 | 14 |
| `3.75` | 0.938 | 약 15 |
| `4.5` | 1.125 | 18 |
| `5.25` | 1.313 | 약 21 |
| `7.5` | 1.875 | 30 |
| `8.5` | 2.125 | 34 |
| `8.75` | 2.188 | 약 35 |
| `11.5` | 2.875 | 46 |

Figma px → Tailwind 변환:

- 4, 8, 12, 16, 20, 24px 등 기본 scale은 Tailwind 기본 class 사용
- 6, 10, 14, 18, 30px 등은 확장 spacing 우선 사용
- 토큰이 없고 시각 재현에 중요한 값만 arbitrary class 예: `px-[17px]`, `gap-[7px]` 허용

### 2.4 Border / Shadow

- thin divider/border는 `border-brightGray`, `border-subCoral/50`, `border-b` 패턴을 우선 사용한다.
- shadow는 반복 사용되는 표준이 아직 없으므로 기존 컴포넌트 사용례를 먼저 따른다.

## 3. Layout 기준

### 3.1 화면 폭

- 최대 콘텐츠 폭: `max-w-content = 468px`
- 고정/중앙 정렬 유틸리티:
  - `.content-container`: `max-w-content mx-auto w-full`
  - `.fixed-content`: `fixed left-0 right-0 max-w-content mx-auto`
- 기본 페이지는 모바일 폭 기준 `w-full mx-auto`로 작성하고, 전역 layout은 `min-h-safe-screen`을 사용한다.

### 3.2 Safe area / fixed 영역

`globals.css`의 CSS 변수를 사용한다.

- `--safe-area-top`, `--safe-area-bottom`
- `--header-height: 20px`
- `--header-height-with-safe`
- `--search-bar-height: 56px`
- `--search-fixed-area-height: 70px`
- `--tab-height: 81px`
- `--navbar-height: 70px`
- `--navbar-margin-bottom`
- `--navbar-total-space`
- `--sticky-cta-space`

관련 utility:

- `pt-safe`, `pt-safe-header`
- `pb-safe`, `pb-safe-lg`
- `pb-navbar`
- `min-h-safe-screen`

고정 상단 헤더 + 탭 아래 콘텐츠는 기존 Explore처럼 `marginTop: calc(var(--header-height-with-safe) + var(--tab-height))` 패턴을 사용할 수 있다.

### 3.3 페이지 padding

- 일반 모바일 콘텐츠 좌우 여백: `px-5`를 기본으로 한다. 현재 Search/User 계열 페이지의 주요 콘텐츠와 리스트 영역이 이 기준을 사용한다.
- Figma 375px 화면에서 카드 폭을 맞춰야 하거나 Explore처럼 기존 화면이 `px-4`로 구성된 경우에는 해당 화면 기준을 유지한다.
- 헤더 내부 좌우: 기존 `SubHeader`는 `px-[17px]` 사용.
- 고정 상단 검색/필터 영역 내부 여백은 `px-5`를 우선한다.
- 카드 리스트는 화면 폭에서 좌우 `16px~20px` 정도를 기준으로 Figma와 기존 화면을 맞춘다.

### 3.4 페이지/섹션 spacing

- 하단 navbar가 있는 페이지는 콘텐츠가 겹치지 않도록 `mb-24`, `pb-20`, `pb-navbar` 중 기존 layout에 맞는 방식을 사용한다.
- 고정 상단 영역 아래 콘텐츠 시작점은 CSS 변수 기반 계산을 우선한다.
  - 검색 고정 영역 아래: `paddingTop: calc(var(--header-height-with-safe) + var(--search-fixed-area-height))`
  - 헤더 + 탭 아래: `marginTop: calc(var(--header-height-with-safe) + var(--tab-height))`
- 주요 섹션 간 큰 간격은 `gap-7`, `pt-8`, `pb-5`를 우선 검토한다.
- 섹션 내부 묶음 간격은 `space-y-4`, `mb-[26px]`, `pt-[22px]` 등 기존 화면 맥락을 따른다.
- 리스트/반복 아이템 내부의 작은 간격은 `gap-2`, `space-y-1.5`, `mt-1.5`, `mt-3` 등 기존 List/Home 패턴을 우선한다.

## 4. 기존 컴포넌트 패턴

### 4.1 Button

파일: `src/components/ui/Button/Button.tsx`

- 기본 CTA: `bg-subCoral`, `text-white font-bold text-15`, `h-[52px]`, `rounded-xl`, `w-full`
- disabled: `bg-brightGray cursor-not-allowed`
- secondary/cancel: `border border-subCoral`, `text-subCoral font-bold text-base`

새 CTA가 위 구조와 같으면 `Button` 또는 `DualButton` 재사용을 우선한다.

### 4.2 Label / Chip

파일: `src/components/ui/Display/Label.tsx`, global component classes

- `.label-default`: white bg + subCoral text/border + `rounded-md py-1 px-3`
- `.label-selected`: subCoral bg + white text/border
- `.label-disabled`: bgGray bg + white text/border
- 검색 키워드 chip은 `label-default inline-flex h-7 items-center gap-1 text-13` 패턴 사용.

### 4.3 Tab

파일: `src/components/ui/Navigation/Tab`

- Default tab: `font-bold`, 약 15px, `pb-2`, bottom border
- active: `.tab-selected` = `text-subCoral border-subCoral border-b`
- inactive: `.tab-default` = `text-subCoral/50 border-subCoral/50 border-b`
- 가로 스크롤/북마크형 tab은 `variant="bookmark"`를 우선 검토한다.

### 4.4 Header / Navbar

파일: `src/components/ui/Navigation/SubHeader.tsx`, `Navbar.tsx`

- `SubHeader`: left/center/right 슬롯 구조, `pt-safe-header`, `px-[17px]`, `pb-[15px]`
- center title: `text-subCoral`, `font-bold`, responsive clamp
- bottom navbar:
  - fixed, `max-w-content`, `bottom: var(--navbar-margin-bottom)`
  - inner height `70px`, `bg-white`, `py-4`, `px-[26px]`, `rounded-[13px]`
  - inactive item opacity `40%`

### 4.5 Search

파일: `src/components/feature/Search/SearchBar.tsx`, `src/app/(primary)/explore/_components/ExploreSearchBar.tsx`

- 일반 검색 input:
  - `h-10`, `rounded-lg`, `bg-white`
  - `text-mainDarkGray`, `placeholder-mainCoral`, `text-15`
  - `border border-mainCoral`
- Explore keyword search:
  - border-bottom input, transparent bg
  - helper text는 `text-12 text-mainGray`
  - keyword 추가 버튼은 `.label-selected text-13`

### 4.6 Modal / Bottom Sheet

- `BottomSheet`: `vaul` Drawer 사용, overlay `bg-black/60`, content `rounded-t-2xl bg-white max-w-content mx-auto`
- modal text classes:
  - `.modal-mainText`: `text-20 text-subCoral font-medium whitespace-pre-wrap mb-2`
  - `.modal-subText`: `text-16 text-mainDarkGray whitespace-pre-wrap mb-3`

### 4.7 List item / Card

- List item은 `border-brightGray border-b`, `text-mainBlack`, vertical padding을 자주 사용한다.
- 이미지가 포함된 카드는 기존 `BaseImage`, `ItemImage`, domain/feature 컴포넌트 재사용 여부를 먼저 확인한다.
- 신규 카드가 특정 화면에만 쓰이면 해당 route의 `_components`에 둔다. 여러 화면 재사용 가능성이 높으면 `src/components/feature` 또는 `src/components/ui`로 승격한다.

## 5. 컴포넌트 설계 원칙

이 섹션은 Figma 화면을 코드로 옮길 때의 컴포넌트 책임, 위치, props 전달 기준이다. 디자인 토큰과 함께 `DESIGN.md`에서 관리한다. 별도 agent skill은 보조 기억으로만 사용하고, 프로젝트 기준의 SSoT는 이 문서로 둔다.

### 5.1 분리 기준

- 한 컴포넌트 파일에는 하나의 모듈만 둔다.
- 불필요하게 많이 쪼개지 않는다. 우선 하나의 개념적 단위가 한 컴포넌트로 구성되도록 한다.
- Figma layer/frame 구조를 그대로 파일 분리 기준으로 삼지 않는다.
- 컴포넌트가 명확히 다른 책임을 갖거나, 재사용/테스트/가독성 측면에서 이득이 분명할 때만 분리한다.
- 단순 wrapper, adapter, 스타일 전달만 하는 얇은 컴포넌트는 만들지 않는다.

### 5.2 컴포넌트 위치 기준

- `src/components/ui`
  - 가장 작은 단위의 atom 성격 컴포넌트
  - 도메인 지식이나 비즈니스 로직을 갖지 않는다.
  - 예: button, label, primitive display, basic input 등
- `src/components/feature`
  - atom 조합으로 만들어진 기능 단위 컴포넌트
  - 특정 도메인에 묶이지 않는 기능을 담당한다.
  - 예: 검색, 모달, 공통 필터 UI 등
- `src/components/domain`
  - BottleNote 비즈니스 로직과 연결된 컴포넌트
  - `alcohol`, `review`, `user`, `explore` 등 도메인 모델/행동에 의존할 수 있다.
- route 내부 `_components`
  - 해당 페이지 전용 컴포넌트
  - 처음에는 화면 전용이면 `_components`에 둔다.
  - 도메인 경계를 벗어나 재사용되기 시작하면 `feature` 또는 `domain`으로 이동한다.

### 5.3 Props / 데이터 전달 기준

- props drilling은 최대 2단계까지만 허용한다.
- API response 전체 객체를 깊게 전달하지 않는다.
- API response를 props로 넘겨야 하는 경우, 하위 컴포넌트가 필요한 최소 정보만 추려서 전달한다.
- 깊은 하위 컴포넌트에서 서버 데이터가 필요하면 `useQuery` 등으로 직접 가져올 수 있도록 식별자/필터 등 필요한 정보만 전달하는 방식을 우선 검토한다.
- UI atom은 데이터 fetch를 직접 하지 않는다. domain/route 계층에서 data fetching 책임을 갖는다.

### 5.4 개념적 단위와 분리 시점

현재 코드베이스는 `HomeFeaturedList`, `ReviewDetails`, `AlcoholItem`처럼 하나의 화면 섹션/카드/기능 블록을 먼저 하나의 개념적 단위로 구현하고, 필요한 경우 하위 표시 컴포넌트를 둔다.

- 기본 개념적 단위 예시
  - 페이지의 한 섹션: 홈 피처드 리스트, 리뷰 상세 본문, 탐색 검색 영역
  - 하나의 카드/아이템: 위스키 카드, 리뷰 리스트 아이템, 유저 정보 표시
  - 하나의 입력/상호작용 블록: 검색바, 필터 드로어, 바텀시트, 댓글 입력
- 분리를 검토하는 경우
  - data fetching/loading/error/empty 분기와 실제 list/item 렌더링이 섞여 읽기 어려워질 때
  - form 상태/submit 로직과 순수 표시 UI가 함께 커질 때
  - 같은 UI 조각이 같은 화면 안에서 반복되거나 다른 화면에서도 재사용되기 시작할 때
  - JSX가 길어져 핵심 흐름이 보이지 않을 때
- 분리하지 않는 경우
  - 단순히 Figma layer가 나뉘어 있다는 이유만 있는 경우
  - props를 그대로 전달만 하는 얇은 wrapper가 되는 경우
  - 한 화면에서만 쓰이고 책임이 하나로 읽히는 경우

### 5.5 Route 전용 → feature/domain 승격 기준

- 신규 화면 구현은 우선 route 내부 `_components`에 둔다.
- 아래 조건 중 하나가 생기면 승격을 검토한다.
  - 동일 UI/행동이 2개 이상의 route에서 재사용된다.
  - 특정 도메인 모델과 강하게 결합되어 다른 route에서도 의미가 유지된다. 예: `review`, `alcohol`, `user`, `history`
  - 도메인과 무관한 기능 조합으로 재사용된다. 예: search, modal, filter drawer, list layout
- 승격 위치
  - 비즈니스 모델/행동 의존이 있으면 `src/components/domain/{domain}`
  - 도메인 독립 기능이면 `src/components/feature/{feature}`
  - atom 수준 primitive면 `src/components/ui/{category}`
- 기존 코드에 여러 컴포넌트를 한 파일에 둔 사례가 있어도, 신규 작성은 “한 컴포넌트 파일 = 하나의 모듈” 원칙을 따른다.

### 5.6 Container / Presentational 분리

컨테이너/프레젠테이션 분리는 기본값이 아니라, 복잡도가 생겼을 때 적용한다.

- route page 또는 feature/domain container가 담당할 수 있는 것
  - `useQuery`, `useMutation`, `useForm`, route params/search params, auth/modal store 연결
  - loading/error/empty 분기
  - API response를 화면에 필요한 형태로 최소 가공
- presentational component가 담당할 수 있는 것
  - 이미 준비된 props 기반 렌더링
  - click/change 등 UI 이벤트를 callback으로 노출
  - 디자인 토큰 기반 스타일링
- 한 파일 안에서 충분히 읽히면 억지로 container/presenter를 만들지 않는다.
- 분리 후 하위 컴포넌트가 props 전달 통로만 되면 잘못 분리한 것으로 본다.

### 5.7 Query hook 위치 기준

- 여러 화면/컴포넌트에서 재사용되는 서버 상태는 `src/queries/useXxxQuery.ts`에 둔다.
- query hook은 가능하면 query key factory, `enabled`, `staleTime`, `gcTime`, `retry` 등 정책을 함께 정의한다.
- route 전용 데이터이지만 페이지가 복잡하면 route container에서 query hook을 호출하고, 하위 컴포넌트에는 필요한 데이터만 전달한다.
- 무한 스크롤/페이지네이션은 기존 `usePaginatedQuery` + `useInfiniteScroll` 패턴을 먼저 검토한다.
- UI atom은 query hook을 직접 호출하지 않는다.
- domain/feature 컴포넌트는 그 컴포넌트가 독립적으로 완결되는 재사용 기능일 때만 query hook 호출을 허용한다. 그렇지 않으면 route/container에서 데이터를 받아 렌더링한다.

### 5.8 Variant / className override 기준

- `variant`는 시각/동작 차이가 명확하고 반복되는 경우에만 둔다.
  - 예: `Tab`의 default/bookmark처럼 variant에 따라 필요한 props가 달라지는 경우는 discriminated union으로 타입을 나눈다.
- 단순 색상/간격 차이만으로 variant를 늘리지 않는다. 우선 토큰 class 조합 또는 기존 컴포넌트 재사용으로 해결한다.
- 신규 컴포넌트는 `className`을 override 이름으로 우선 사용한다.
  - 기존 코드의 `styleClass`, `btnStyles`, `textSize` 등은 legacy 패턴으로 보고 새 API에서는 남발하지 않는다.
- `className` 허용 대상
  - layout 조정이 필요한 container/primitive
  - 아이콘/이미지 크기처럼 호출부 맥락에 따라 달라지는 atom
- `className` 지양 대상
  - 도메인 컴포넌트 내부의 핵심 색상/spacing을 외부에서 무제한 덮어써야 하는 구조
  - 컴포넌트 책임을 흐리는 다수의 `xxxClassName` props
- class 병합이 필요한 경우 `src/lib/utils.ts`의 `cn` 사용을 우선한다.

## 6. 이미지 / 아이콘

- 정적 자산은 `public/` 아래 기존 구조를 우선 사용한다.
  - 예: `public/icon/...`, `public/bottle_note_Icon_logo.svg`
- SVG 아이콘은 기존 파일이 있으면 재사용한다.
- Figma에서 새 아이콘/이미지를 export할 때는 중복 자산 여부를 먼저 확인한다.
- `next/image` 사용을 기본으로 한다. remote 이미지/동적 이미지는 기존 `BaseImage`/도메인 이미지 컴포넌트 패턴을 확인한다.

## 7. Figma → Code 변환 규칙

1. Figma MCP에서 frame/node 구조와 텍스트, 이미지, 스타일을 확인한다.
2. Figma 색상은 이 문서의 Color token으로 먼저 매핑한다.
3. Figma typography는 `text-*`, `font-*`, 필요 시 `tracking-*`으로 매핑한다.
4. Figma Auto Layout은 Tailwind `flex`, `grid`, `gap`, `items-*`, `justify-*`로 매핑한다.
5. Figma spacing은 Tailwind scale 우선, 필요 시 arbitrary value를 최소 사용한다.
6. 복잡한 gradient/blur/shadow는 기존 토큰이 없으면 arbitrary class를 허용하되, 반복 사용될 가능성이 있으면 토큰화 후보로 남긴다.
7. 구현 후 lint/build 또는 최소 타입 체크 가능한 검증을 수행한다.

## 8. 새 화면 구현 체크리스트

- [ ] 기존 route/layout/header/navbar 구조와 충돌하지 않는가?
- [ ] `content-container`, `fixed-content`, safe-area utility를 적절히 사용했는가?
- [ ] 색상을 hex 대신 Tailwind token으로 매핑했는가?
- [ ] 기존 Button, Label, Tab, Search, Modal 컴포넌트를 재사용할 수 없는지 확인했는가?
- [ ] 하단 navbar 또는 sticky CTA와 콘텐츠가 겹치지 않도록 `pb-navbar`/`--sticky-cta-space`를 고려했는가?
- [ ] empty/loading/error 상태가 필요한 화면이면 기존 skeleton/empty/error 컴포넌트를 확인했는가?
- [ ] 컴포넌트 분리가 개념적 단위 기준이며, Figma layer 기준 과분리가 아닌가?
- [ ] props drilling이 2단계를 넘지 않고, API response 전체를 깊게 전달하지 않는가?
- [ ] route 전용/feature/domain/ui 위치 기준에 맞는가?

## 9. 아직 확정이 필요한 정보

아래 항목은 현재 코드 기준으로 추정하거나 비워둔 부분이다. 디자인/기획 기준이 정해지면 이 문서에 추가한다.

- 버튼 variant 전체 정의
  - primary, secondary, outline, ghost, disabled, destructive 등
- form field 상태별 스타일
  - focus, error, disabled, readonly, helper text
- loading/skeleton/empty/error 상태의 화면별 사용 기준
- Figma SVG/icon export 및 네이밍 규칙
- 이미지 fallback, blur, gradient overlay 표준
- 접근성 기준
  - touch target 최소 크기, aria-label 규칙, contrast 기준
