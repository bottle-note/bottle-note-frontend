# 현재 UI 조사 — DESIGN.md 초안의 근거

조사일: 2026-09-23. 브랜치: `docs/update-product-agent-guidelines`, 조사 시작 HEAD: `89e32053`.

목적은 현재 디자인 규격과 불일치를 분리해 DESIGN.md의 기준을 만드는 것이다. 애플리케이션 코드는 수정하지 않았다. 이 문서는 조사 기록이며, 디자인 규칙의 원본은 루트 DESIGN.md다.

## 1. 범위와 방법

- `src`의 테스트 제외 TSX/CSS 267개 파일을 대상으로 스타일·레이아웃 패턴을 검색했다. 이 수에는 OG 이미지 등 일반 화면이 아닌 파일도 포함된다.
- 36개 `page.tsx`와 모든 route layout의 구성·참조·스타일 선언을 추적했다. 전체 파일을 동일 깊이로 정독하거나 모든 화면 상태를 실행한 것은 아니다.
- Tailwind 설정, 전역 CSS, 팔레트·의미 색상, 테마 초기화, 공통 UI, 주요 도메인·페이지 전용 컴포넌트를 상세 확인했다.
- 본 작업 디렉터리의 실행 서버인 `http://localhost:3001`을 Playwright MCP로 확인했다. 다른 worktree 서버인 3000은 근거에서 제외했다.
- 기본 viewport는 390×844, 추가 확인은 상세 320×740과 필터 1024×900이다. 다크 테마는 브라우저의 시스템 테마 에뮬레이션으로 확인했다.
- 기존 브라우저 세션을 그대로 사용했다. 인증 우회·API 목킹·리뷰 제출·별점·찜·팔로우 등 서버 데이터 변경은 하지 않았다.
- 자동 검색상 legacy 색상 클래스가 있는 파일은 25개, white/black 직접 클래스는 31개였다. 사진 overlay·독립 콘텐츠 같은 유효한 예외를 포함하므로 이 숫자는 결함 개수가 아니다.

## 2. 전체 페이지 분류

아래는 코드 조사 대상이다. 브라우저 확인 범위는 다음 절에서 별도로 구분한다.

| 영역        | 페이지 경로                                                                  | 주요 레이아웃·확인점                                     |
| ----------- | ---------------------------------------------------------------------------- | -------------------------------------------------------- |
| 홈          | `/`                                                                          | NavLayout, 자동 숨김 로고, 배너·가로 추천, pb-20         |
| 탐색        | `/explore`                                                                   | TabbedListPageHeader, 좌우 16px, 가상 목록               |
| 검색        | `/search`, `/search/input`                                                   | fixed 검색 헤더와 별도 입력 페이지, 흰 배경 잔존         |
| 주류        | `/search/[category]/[id]`, 하위 `/reviews`                                   | 이미지·정보 헤더, 중복 NavLayout, 하단 작성 행동         |
| 리뷰        | `/review/[id]`, `/review/register`, `/review/modify`                         | 코랄 헤더, 본문·선택 입력, 댓글 또는 제출 영역           |
| 큐레이션    | `/curation`, `/curation/[id]`                                                | 탭 목록, 콘텐츠 유형별 카드·상세, 목록에서만 navbar      |
| 수입통관    | `/import-clearance`, 하위 `/alcohol/[id]`, `/importer/[id]`                  | 목록 20px, 정형 정보, 로그인 제한·CTA                    |
| 사용자      | `/user/[id]`, 하위 `/edit`, `/follow`, `/my-bottle`                          | 프로필 집계·타임라인, 검색·탭 목록, 입력                 |
| 히스토리    | `/history`                                                                   | SubHeader, 필터와 타임라인                               |
| 설정        | `/settings`, `/settings/marketing-consent`                                   | 메뉴 24px, 동의 화면 20px, 내부 설정 화면 전환           |
| 문의        | `/inquire`, 하위 `/register`, `/[id]`                                        | 목록·입력·상세, 별도 fixed 버튼                          |
| 신고·이미지 | `/report`, `/image-viewer`                                                   | 입력 및 전체 이미지 표시, 화면별 높이                    |
| 정책        | `/terms`, `/privacy-policy`, `/privacy-collection-use`, `/marketing-consent` | 공통 LegalPageHeader·LegalDocumentRenderer               |
| 로그인·가입 | `/login`, `/agreements`, `/oauth/kakao`                                      | custom layout, 소셜 로그인·약관·콜백                     |
| 독립 콘텐츠 | `/whiskey-mbti`, `/whiskey-tarot`                                            | 전용 색상·폰트·레이아웃·진행 화면                        |
| 오류        | `/error`                                                                     | 별도 페이지. global-error·not-found도 스타일 조사에 포함 |

## 3. 브라우저에서 확인한 근거

스크린샷은 로컬 `.playwright-mcp/design-*.png`에 보관했다. 아래 파일은 저장 후 직접 열어 확인했다. 개발 데이터·개발 도구 버튼을 포함하므로 승인된 디자인 이미지나 제품 문구 원본으로 사용하지 않는다. 아직 영구 reference asset으로 선정하지 않았다.

| 화면·상태                   | 파일                               | 확인한 내용                                                |
| --------------------------- | ---------------------------------- | ---------------------------------------------------------- |
| 홈, light                   | `design-01-home.png`               | 브랜드 헤더, 배너, bookmark 탭, 추천 카드, 떠 있는 navbar  |
| 리뷰 탐색, light            | `design-02-explore.png`            | 좌우 16px, 리뷰 정보 위계, 구분선                          |
| 시음회 목록                 | `design-03-curation.png`           | 좌우 20px, 이미지 카드 안 일정·장소·비용 표면              |
| 수입통관 목록               | `design-04-import.png`             | 20px 여백, 이름·영문명·수입사·날짜의 압축된 목록           |
| 설정                        | `design-05-settings.png`           | 24px 여백, 그룹별 제목과 메뉴, 하단 메뉴 없음              |
| 리뷰 작성 초기 화면         | `design-06-review.png`             | 주류 미선택, 별점·본문·선택 입력, 등록 버튼 위치           |
| 주류 상세 `/search/all/276` | `design-11-detail.png`             | 병 이미지 140×230px, 코랄 헤더, 본문 20px, DOM navbar 2개  |
| 리뷰 상세 `/review/166`     | `design-12-review-detail.png`      | 주류 요약·사용자 리뷰·댓글 없음·댓글 입력·navbar           |
| 프로필 `/user/38`           | `design-13-profile.png`            | 프로필·세 지표·활동 타임라인                               |
| 약관                        | `design-14-legal.png`              | 긴 글의 제목·본문 행간과 페이지 여백                       |
| MBTI 시작                   | `design-15-mbti.png`               | 일반 UI와 다른 전용 폰트·배경·버튼                         |
| 리뷰 탐색, dark             | `design-17-explore-dark.png`       | 오크 배경, 밝은 본문, amber 별점. 루트 `.dark` 확인        |
| 검색 입력, dark             | `design-18-search-dark.png`        | 의미 색상으로 바뀐 입력·최근 검색 영역과 고정 흰 배경 공존 |
| 리뷰 검색 포커스            | `design-19-focus-stable.png`       | 로고·하단 메뉴 숨김, 탭과 입력 영역 상승                   |
| 필터, 1024×900              | `design-20-filter-wide-stable.png` | 중앙 468px 앱과 별개로 viewport 우측에 288px drawer        |
| 주류 상세, 320×740          | `design-21-detail-320.png`         | 가로 문서 overflow는 없지만 제목·행동 문구의 과도한 줄바꿈 |

동작 확인: 탐색 탭 전환, 검색 포커스·해제, 필터 열기·닫기, 문서 스크롤, viewport 변경, 시스템 다크 테마. 검색 포커스와 스크롤 후 navbar의 숨김 상태를 확인했다. 실제 검색어 입력·결과 검증, 무한 스크롤 네트워크 전후 비교는 이번 디자인 조사에서 수행하지 않았다.

`design-07-whiskey.png`, `design-08-search-focus.png`, `design-10-filter-wide.png`는 데이터 로딩 또는 전환 중 캡처여서 완성 화면의 근거에서 제외했다. 초기에 공유 브라우저의 다른 페이지로 이동한 결과와 빈 스크린샷도 제외하고, 이후 호출별 별도 탭으로 본 작업 서버를 확인했다.

미확인: 실제 모바일 키보드·Flutter WebView·safe-area 실기기, 모든 비로그인 상태, 로그인·가입 완료, 리뷰 저장·수정, 시음회 신청, 전체 route의 light/dark와 오류 상태. 작성 화면을 열어 본 것으로 등록 흐름 검증을 대신하지 않는다.

## 4. 문서에서 바로 정정할 사실

| 기존 문서                                      | 현재 코드                                | 초안 반영                                      |
| ---------------------------------------------- | ---------------------------------------- | ---------------------------------------------- |
| fg-neutral light = neutral-1000                | neutral-950                              | 값 복사 표 대신 역할·소스 링크                 |
| fg-brand light = coral-700, rating = amber-700 | 둘 다 coral-600, dark rating만 amber-500 | 테마별 의미 설명 정정                          |
| brand contrast light = coral-1000              | static-white                             | 실제 대비 조합 참고                            |
| 일부 neutral stroke·disabled·weak 값           | 현재 CSS와 다름                          | 오래된 전체 매핑표 제거                        |
| Button priority/appearance/tone 예시           | btnName/onClick/btnStyles API            | 미구현 API 예시 제거                           |
| BottomSheet bg-white, modal legacy 색상        | floating·semantic 역할 적용됨            | 현재 공통 컴포넌트 기준                        |
| Explore 상단 = header + tab-height             | logo-header 변수 조합                    | 현재 사용처로 변경. tab-height는 선언만 검색됨 |
| 모든 13pt를 medium에 매핑                      | 크기와 굵기는 독립                       | Figma 크기·행간·굵기 각각 확인                 |
| props 최대 2단계·파일당 모듈 1개               | 디자인 판단과 직접 무관                  | AGENTS의 책임·데이터 흐름 기준으로 통합        |

## 5. 표준으로 복제하면 안 되는 구현

### A. 레이아웃 책임

- **브라우저·코드 확인:** 주류 상세는 `search/layout.tsx`와 상세 `page.tsx`에서 각각 NavLayout을 사용한다. 390px와 320px에서 DOM navbar가 2개였다. 겹쳐 보인다고 정상 단일 메뉴로 간주하면 안 된다.
- **코드 확인:** 홈 pb-20, 검색·프로필 mb-24, 수입통관 pb-navbar, 리뷰 폼 sticky-cta-space 등 하단 확보 방식이 다르다. NavLayout 자체는 본문 하단 공간을 보장하지 않는다.
- **코드 확인:** ReviewDetails·ReviewUserHeader·ReviewPriceLocation은 내부 mx-5, ReviewForm은 내부 px-5를 갖는다. 외부에 같은 여백을 더하면 이중 패딩이 된다.
- **코드 확인:** StickyBottomCta와 Navbar는 같은 bottom 변수를 쓴다. StickyBottomCta 주석의 '내비바 위'를 실제 위치 계약으로 믿으면 안 된다.

근거: `src/components/ui/Layout/{NavLayout,StickyBottomCta}.tsx`, `src/app/(primary)/search/layout.tsx`, `src/app/(primary)/search/[category]/[id]/page.tsx`, `src/app/(primary)/review/[id]/_components/`, `src/app/(primary)/review/_components/form/ReviewForm.tsx`.

### B. 앱 프레임과 고정 요소

- **브라우저·코드 확인:** SideFilterDrawer는 1024px 화면에서 앱 우측 끝(746px)이 아닌 viewport 우측 끝(1024px)에 붙었다. 의도된 데스크톱 예외인지 결정이 필요하다.
- **코드 확인, 해당 상태 미실행:** LoginGate clear는 `fixed left-0 right-0`이며 max-w-content가 없다. `safe-area-bottom` 클래스도 저장소에서 정의를 찾지 못했다.
- **코드 확인, 넓은 화면 미실행:** ReplyForm은 fixed-content와 max-w-2xl을 함께 써 폭 기준이 충돌할 여지가 있다.
- **코드 확인:** pb-safe·pb-safe-lg는 Android fallback을 합친 변수가 아닌 env 값을 직접 쓴다. 모든 safe-area helper가 동일 계약은 아니다.

근거: `src/components/feature/SideFilterDrawer/index.tsx`, `src/components/feature/auth/LoginGate.tsx`, `src/app/(primary)/review/[id]/_components/Reply/ReplyForm.tsx`, `src/style/globals.css`.

### C. 테마와 시각 규격

- **브라우저·코드 확인:** search/input의 bg-white가 다크 모드에서도 남는다. 일반 배경은 역할 기반으로 표현한다는 기준과 구현이 다르다.
- **코드 확인:** body는 Suit, input·textarea는 Noto Sans 선언이다. 폰트 차이가 의도인지 미결정이다. Noto Sans의 실제 로드 여부는 별도 확인이 필요하다.
- **브라우저 확인:** 320px 주류 상세에서 140px 병 이미지와 여백을 유지한 결과 제목·리뷰 작성·찜하기 문구가 여러 줄로 끊긴다. 단순 overflow 검사로 가독성 검증을 대신할 수 없다.
- **코드 확인:** z-index 9/10/20/30/40/50 외에 ImageModal 9999 등 별도 값이 있다. 공통 layer 표준이 완성된 상태가 아니다.
- **코드 확인:** 홈 AlcoholItem 내부에 별도 AlcoholImage 구현도 존재한다. 같은 이름이 같은 규격·구현을 보장하지 않는다.

근거: `src/app/(primary)/search/input/page.tsx`, `src/style/globals.css`, `src/app/(primary)/search/[category]/[id]/_components/AlcoholDetailHeader.tsx`, `src/components/ui/Modal/ImageModal.tsx`, `src/components/feature/home/AlcoholItem.tsx`.

### D. 상태·사용성과 독립 콘텐츠

- **코드 확인:** EmptyView 고정 높이 288px, ErrorFallback 100vh-120px는 모든 컨테이너에 맞는 규격이 아니다.
- **코드 확인:** 전역 텍스트 선택 금지, input outline 제거, viewport 확대 제한이 있다. 접근성 검증을 통과한 기준으로 취급하지 않는다. 약관은 선택을 별도로 복구한다.
- **코드 확인:** reduced-motion 처리는 공통 스크롤 전환·MBTI·일부 모달에 있으며 모든 애니메이션에 공통 적용되는 상태는 아니다.
- **브라우저·코드 확인:** MBTI는 전용 폰트·토큰·14px 좌우 여백을 사용한다. 타로는 코드상 전용 어두운 표면과 연출을 사용한다. 일반 제품 화면의 예외로 구분한다.
- 스크린샷의 개발용 테스트 문구, 테스트 사용자와 devtools 버튼은 디자인 표준에서 제외한다.

근거: `src/components/ui/Display/{EmptyView,ErrorFallback}.tsx`, `src/app/layout.tsx`, `src/style/globals.css`, `src/components/feature/legal/LegalDocumentRenderer.tsx`, `src/app/(custom)/whiskey-mbti/mbti.module.css`, `src/app/(custom)/whiskey-tarot/_components/TarotLayoutClient.tsx`.

## 6. 제안하는 결정 순서

1. **레이아웃 책임과 신규 기본 여백:** 앱 폭 468px·본문 20px를 기본으로 하고 기존 16/24px는 해당 유형의 예외로 둘지 결정한다.
2. **고정 요소의 프레임:** drawer·CTA·댓글 입력을 앱 폭에 맞출지, 데스크톱 예외를 허용할지 정한다.
3. **대표 화면:** 홈·탐색·주류 상세·작성·큐레이션에서 참고할 영역을 선정하고 알려진 결함을 제외한다.
4. **추가 시각 토큰:** 폰트·행간·터치 영역·상태 색상·layer 규격을 정한다. 현재 사용 빈도만으로 결정하지 않는다.

위 내용은 최초 조사 시점의 기록이다. 이후 합의·반영 내역은 아래에 구분한다.

## 7. 조사 이후 결정·반영

- 모바일 본문의 좌우 여백은 16px·20px 실제 화면 비교 후 **20px로 확정**했다.
- `explore/page.tsx`의 공통 본문 영역을 `px-4`에서 `px-5`로 변경했다. 리뷰·위스키 탭의 검색과 목록에 적용되며 헤더·탭·navbar 규격은 유지한다.
- 다른 기존 화면은 해당 화면을 정리할 때 기준을 적용한다. 위 조사 표와 스크린샷의 16px 표시는 변경 전 근거로 보존한다.
- 나머지 디자인 결정과 구현상의 차이는 계속 검토한다. 자동 테스트 도구 변경, 커밋·푸시는 아직 수행하지 않았다.
