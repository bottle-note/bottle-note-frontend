# 디자인 검토 메모

2026-09-23 기준. 조사와 제안이며 확정된 디자인 규칙이 아니다. 규칙은 [DESIGN.md](../../DESIGN.md)에만 기록한다.

## 남은 결정

- 글자 역할별 크기·줄 높이·굵기.
- 겹치는 요소의 순서, 오류·성공·경고 색상.
- 최소 조작 영역과 색상 대비, 대표 화면.
- 넓은 화면의 패널·댓글 입력·하단 버튼 배치는 후속 폼팩터 설계에서 결정.

## 문서 작성 참고

- 2026-09-24: Google Labs의 공식 DESIGN.md **alpha 초안 명세**에 맞춰 문서를 Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts 순으로 재구성했다. [공식 발표](https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/), [명세](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md). Stitch 화면에서 문서를 추출하는 [5개 섹션 스킬 템플릿](https://github.com/google-labs-code/stitch-skills/blob/main/plugins/stitch-utilities/skills/design-md/SKILL.md)과 독립 포맷 명세를 구분했다.
- 기존 규격은 보존하고 디자인 톤·정보 위계·화면 조합·컴포넌트 선택 기준을 검토용 초안으로 추가했다. 공통 글자 수치, 그림자·겹침 순서, 상태 색상은 여전히 미확정이다. 다음 작업은 대표 화면과 초안을 비교하고 역할별 수치와 공통 요소의 상태·사용 조건을 채우는 것이다.
- [designmd.ai 안내](https://designmd.ai/what-is-design-md): 색·글자·간격·컴포넌트의 값과 사용법을 함께 설명한다. 커뮤니티 사례집이며 제품의 정답은 아니다.
- [Google Labs 형식 문서](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md): 토큰은 값, 본문은 적용 맥락을 담당한다. YAML 토큰 선언은 선택 사항이다.
- [Genesis](https://designmd.ai/chef/genesis), [Flip7](https://designmd.ai/yiujc/flip7-card-game): 역할별 값·사용처와 금지사항을 묶는 구성 참고. 다른 제품의 수치나 분위기는 가져오지 않는다.
- 적용: 짧은 사용처·토큰 표를 쓰고, 값은 기존 CSS를 참조한다. 확정 수치는 남기되 미확정 값을 채워 넣지 않는다. 독립 배포용 형식이 아닌 저장소 내부 지침으로 사용한다.

## 간격 규격의 근거

사용자가 현재 구현에 근거한 수치 결정을 위임했다. 다음 코드 사용례에서 기본값을 선정해 DESIGN.md에 반영했다. 전체 화면이 이미 통일되어 있다는 뜻은 아니다. 이번 확인은 코드 기준이며 브라우저 실측은 하지 않았다.

| 사용례                                                   | 관찰값                     | 판단                          |
| -------------------------------------------------------- | -------------------------- | ----------------------------- |
| TastingEventInfoCard의 제목·부연, WhiskeyListItem의 태그 | gap-1 = 4px                | 한 정보의 세부 요소           |
| WhiskeyListItem의 이름·평가 정보                         | space-y-2 = 8px            | 관련 정보                     |
| WhiskeyListItem의 이미지·본문                            | gap-3 = 12px               | 이미지와 설명                 |
| 큐레이션 상세의 제목·목록, HomeTastingEventPreview 카드  | mt-4, gap-4 = 16px         | 제목·내용과 일반 카드 간격    |
| MarketingConsentSettings의 별도 안내·설정 영역           | mt-8 = 32px                | 독립된 묶음의 기본값으로 선택 |
| TastingEventInfoCard                                     | 패딩 16px, 행 간격 16/24px | 여러 줄 표시형의 차이 유지    |
| 큐레이션 피드                                            | space-y-7 = 28px           | 큰 피드 카드 전용 규격 유지   |
| WhiskeyListItem                                          | py-6 = 각 24px             | 행 패딩이며 카드 간격과 구분  |

이전 제안의 ‘카드 사이 12px’는 채택하지 않았다. 리뷰의 10·22px, 설정의 22·25·27px, 홈의 59px 등은 현재 화면별 값으로 남기고 자동 반올림하지 않는다. 큐레이션 섹션의 py-6도 인접 영역의 여백과 합쳐질 수 있어 ‘섹션 사이 24px’로 해석하지 않았다.

## 글자 토큰 후보

| 역할            | 용도              |
| --------------- | ----------------- |
| heading-page    | 콘텐츠 대표 제목  |
| heading-section | 섹션 제목         |
| title-item      | 카드·목록의 이름  |
| body-primary    | 핵심 본문         |
| body-secondary  | 부가 설명·도움말  |
| label           | 버튼·탭·선택 문구 |
| caption         | 날짜·정보 배지    |
| value-emphasis  | 강조 평점·집계    |

이름과 수치는 미확정이며 구현된 클래스가 아니다. 탐색 헤더 제목과 약관의 별도 역할이 필요한지도 검토한다.

| 현재 사용례          | 크기 / 줄 높이 / 굵기      |
| -------------------- | -------------------------- |
| 큐레이션 대표 제목   | 20 / 24px / extrabold      |
| 큐레이션 섹션 제목   | 16 / 20px / extrabold      |
| 리뷰 본문            | 15 / 19px / 별도 지정 없음 |
| 시음회·큐레이션 설명 | 13 / 17px / medium         |
| 프로그램·페어링 설명 | 13 / 약 22px / medium      |
| 기본 버튼            | 15 / 19px / bold           |
| 기본 탭              | 약 15 / 17.2px / bold      |
| 리뷰 작성일·배지     | 각각 13 / 17px, 10 / 14px  |
| 프로필 집계          | 27 / 31px / extrabold      |
| 약관 본문            | 14 / 28px                  |

15 / 24px 본문과 보조 정보 12px는 이전 제안일 뿐 합의되지 않았다. 대표 화면 비교 후 정한다.

## 기존 패턴 찾기

컴포넌트 규격표는 다음 소스를 확인해 작성했다. 렌더링 실측이 아닌 기본 클래스·스타일 기준이며 호출부 재정의는 별도다.

| 분류           | 소스                                                                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 헤더           | `src/components/ui/Navigation/{SubHeader,AutoHideLogoHeader}.tsx`, `src/components/feature/TabbedListPage/TabbedListPageHeader.tsx`                  |
| 검색·탭·태그   | `src/components/feature/Search/`, `src/components/ui/Navigation/Tab/variants/`, `src/components/ui/Display/Label.tsx`                                |
| 목록·커버      | `src/app/(primary)/explore/_components/`, `src/app/(primary)/curation/_components/`, 주류 상세·마이보틀의 `ReviewListItem.tsx`                       |
| 입력·버튼      | 프로필 `EditForm.tsx`, 리뷰 `ContentForm.tsx`·`PriceForm.tsx`, `src/components/ui/Button/Button.tsx`, `src/components/ui/Layout/StickyBottomCta.tsx` |
| 고정·겹침 영역 | `src/components/ui/Navigation/Navbar.tsx`, `src/components/ui/Modal/{Modal,BottomSheet}.tsx`, `src/components/feature/SideFilterDrawer/index.tsx`    |

`rounded-lg/md/sm`은 프로젝트의 radius 설정에 따라 각각 8/6/4px다. 헤더 높이에 검색창 높이를 포함하지 않는다. 자동 높이·내용별 패딩을 임의 고정값으로 채우지 않았다. 작은 클릭 영역과 안전 여백 누락은 신규 표준으로 승인하지 않았다.

- 상세·설정 헤더: SubHeader. 홈·프로필: AutoHideLogoHeader.
- 탭형 목록: TabbedListPageHeader + StickySearchBar. 검색·스크롤에 따른 노출 변화 확인.
- 시음회: TastingEventInfoCard, CurationDetailHeader. 리뷰 작성: ReviewForm.
- 프로필: UserInfo, HistoryOverview. 약관: LegalDocumentRenderer.
- 확인·알림: Modal. 선택: BottomSheet. 복합 필터: SideFilterDrawer.

## 구현 때 확인할 차이

- 입력창 Noto Sans와 MBTI·타로 전용 글꼴은 SUIT로 이관할 대상이다.
- 설정의 24px 여백은 기존 값이다. 페이지별 여백 이관은 별도 조사 문서를 따른다.
- SubHeader는 일반 흐름이다. CurationDetailHeader는 고정 헤더 공간을 자체 확보한다.
- 헤더 변수 20px는 전체 높이가 아니다. 이전 header-height-with-safe + tab-height 계산을 복사하지 않는다.
- Navbar: 외부 좌우 16px, 내부 좌우 26px, 높이 70px, 모서리 13px. 하단은 max(24px, safe-area-bottom + 8px).
- StickyBottomCta: 높이 52px, 좌우 20px. Navbar와 같은 하단 위치이므로 함께 쓰면 별도 배치가 필요하다.
- pb-safe 계열은 iOS 환경 값을 직접 사용한다. Android WebView 보정 포함 여부를 확인한다.
- text-16은 16/20px, text-base는 16/24px다. 같은 크기라도 줄 높이가 다르다.
- Button은 높이 52px, 모서리 12px다. 실제 props를 확인하고 없는 priority/appearance/tone을 가정하지 않는다.
- PrimaryLinkButton은 탐색 카드다. 일반 제출 버튼이 아니다. BookmarkTab은 146×32px다.
- 병 이미지: 홈 145×145, 기본 89×89, 탐색 95×128, 상세 외곽 140×230px. 흰 이미지 표면은 다크에서도 유지된다.
- BottomSheet 기본 80vh·상단 모서리 16px는 현재 값이지 모든 시트의 목표가 아니다.
- z-index는 검색 9, navbar·목록 헤더 10, CTA 20, 상세 헤더 30, backdrop 40, 시트 50으로 분산되어 있다.
- 브랜드 primary 명칭은 행동 위계를 뜻하지 않는다. 별점은 light에서 coral, dark에서 amber다.
- 역할 색상에 임의 투명도를 붙이거나 다른 구분선 토큰을 같은 색으로 간주하지 않는다.
- 전역 포커스 테두리 제거·확대 제한·텍스트 선택 금지, 일부만 적용된 동작 줄이기는 기존 제약이며 디자인 표준이 아니다.

## 시각 방향 제안

탐색은 정보 비교, 큐레이션은 이미지·제목, 마이보틀은 개인 기록을 중심으로 구성한다. 코랄은 주요 행동과 선택을 강조한다. MBTI·타로의 별도 연출을 일반 화면으로 확장하지 않는다. 대표 화면을 비교한 뒤 확정한다.
