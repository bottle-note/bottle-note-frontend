# 페이지별 본문 여백 책임 조사

2026-09-23. 둘러보기 본문 20px 적용 이후의 코드 기준이다. 36개 page와 관련 layout·본문 컴포넌트를 추적했다. 이번 조사는 코드상의 책임 확인이며 모든 페이지를 브라우저에서 다시 실행한 것은 아니다. 기존 브라우저 확인은 [현재 UI 조사](current-ui-audit.md)를 참고한다.

확정 기준: 일반 모바일 본문 좌우 20px. 페이지 또는 페이지 셸이 바깥 여백을 담당하고, 재사용하는 카드·목록·본문은 내부 간격을 담당한다. 페이지 전용 Screen이 셸을 맡는 것은 허용한다. 아래의 ‘분산’은 즉시 두 배의 여백이 생긴다는 뜻이 아니라, 부모가 기준을 적용하면 중복될 위험이 있다는 뜻이다.

## 1. 페이지별 현황

경로의 `[id]` 등은 동적 route다. 값은 일반 본문 기준이며 헤더·카드 내부 여백과 구분했다.

| 페이지                            | 현재 여백 담당·값                                                                                          | 판단 / 후속 정리                                                                                             |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `/`                               | MbtiPromoCard `mx-16`; HomeFeaturedSection `pl-[25px]`; HomeCategorySection `px-[25px]`                    | 16/25px와 전체 폭 배너 혼재. 페이지에서 본문 정렬과 가로 목록 시작·끝 여백을 결정                            |
| `/explore`                        | page의 ExploreContent `px-20`; ExploreSearchBar `-mx-16 px-16`                                             | 본문은 20px 확정·반영. 검색 내용은 상쇄되어 20px지만 배경은 화면 끝에서 4px 남으므로 보정 책임 정리 필요     |
| `/search`                         | page의 검색·결과 영역 `px-20`, 가로 선택 영역 `pl-20`                                                      | 페이지가 영역별로 관리. 전체 폭/가로 목록 구성을 유지하며 정리 가능                                          |
| `/search/input`                   | page의 검색 줄 `px-20`; RecentSearch 자체 `px-20`                                                          | 최근 검색 본문의 바깥 여백이 재사용 컴포넌트에 분산                                                          |
| `/search/[category]/[id]`         | page의 여러 `mx-20`; AlcoholDetailHeader `px-20`; FlavorTags·AlcoholImportClearance `mx-20`                | 본문·도메인 컴포넌트에 분산. 전체 폭 코랄 표면은 유지하고 영역별 책임 이관. 중복 NavLayout은 별도 문제       |
| `/search/[category]/[id]/reviews` | page의 목록·하단 작성 영역 `px-20`                                                                         | 페이지 관리. 고정 버튼 아래 공간은 별도 점검                                                                 |
| `/review/[id]`                    | ReviewDetails·ReviewUserHeader·ReviewPriceLocation·ReviewInteractionBar·FlavorTags·ReplyItemList에 `mx-20` | 분산이 큰 대표 사례. 본문·구분선·댓글 영역을 나눠 셸이 책임지도록 정리                                       |
| `/review/register`                | ReviewForm `px-20`, AlcoholInfo `px-20`, page의 sticky 버튼 `px-20`                                        | 작성/수정 공통 본문과 page의 책임이 분산. 헤더 표면·본문·하단 행동의 경계를 명시                             |
| `/review/modify`                  | register와 동일한 ReviewForm·AlcoholInfo, 별도 page 버튼                                                   | 작성·수정을 함께 정리해야 두 화면의 기준 유지                                                                |
| `/curation`                       | page가 검색·로딩·오류·빈 상태·피드에 `px-20` 적용                                                          | 검색의 기존 16px를 20px로 변경 완료. 카드 목록과 정렬선 통일                                                 |
| `/curation/[id]`                  | page 내부 상세 또는 ProgramDetail·WhiskyPairingDetail의 본문 구간 `px-20`, 커버 전체 폭                    | 유형별 상세 컴포넌트가 화면 셸 역할. 내부 정보 카드 `px-16`는 정상적인 카드 패딩                             |
| `/import-clearance`               | ImportClearanceList·ImporterList의 화면 컨테이너 `px-20`                                                   | 탭별 셸에서 관리. ImportClearanceFilter는 `-mx-16 px-16`, ImporterFilter는 `-mx-20 px-20`여서 배경 확장 차이 |
| `/import-clearance/alcohol/[id]`  | page의 헤더 정보 `px-20`, 본문·로딩 `mx-20`                                                                | 페이지에서 영역별 관리. LoginGate 자체의 프레임과 패딩은 따로 확인                                           |
| `/import-clearance/importer/[id]` | page의 헤더 정보 `px-20`, 본문·로딩 `mx-20`                                                                | 페이지 관리. 일반 본문과 카드 내부 패딩을 구분                                                               |
| `/user/[id]`                      | page의 프로필·히스토리 영역 `px-20`                                                                        | 페이지 관리. TimelinePreview 최대 폭 399px는 추가 폭 제약이므로 넓은 모바일에서 별도 확인                    |
| `/user/[id]/edit`                 | page의 이미지·EditForm 래퍼 `px-20`                                                                        | 페이지 관리. 프로필 이미지의 절대 위치는 여백 규칙과 별개                                                    |
| `/user/[id]/follow`               | page의 탭·목록 래퍼 `px-20`                                                                                | 페이지 관리. 아이템 내부 배치 유지                                                                           |
| `/user/[id]/my-bottle`            | page가 검색에 `p-20`, 탭·목록에 `px-20`                                                                    | 페이지 관리. 위쪽 20px 여백은 좌우 기준과 구분                                                               |
| `/history`                        | page가 검색에 `px-20`; TimelineFull 자체 `p-20`                                                            | 타임라인의 바깥 여백이 domain 컴포넌트에 분산. 검색과 본문의 책임 통합 후보                                  |
| `/settings`                       | SettingsMainScreen·메뉴형 SettingsSubScreen `px-24`; ThemeSettings·BlockManagement 자체 `px-24`            | 24px. custom 화면 분기에는 부모 px-6이 없어 현재 이중 48px는 아님. 설정 셸 책임으로 통합 후보                |
| `/settings/marketing-consent`     | MarketingConsentSettings의 본문·로딩 `px-20`                                                               | 전용 화면 컴포넌트가 셸 역할. 표 셀 16px는 내부 패딩                                                         |
| `/inquire`                        | page의 목록·고정 버튼 `px-20`                                                                              | 페이지 관리. InquireTable 셀 패딩은 내부 패딩                                                                |
| `/inquire/register`               | page가 form·첨부 영역을 `mx-20`로 감쌈                                                                     | 페이지 관리. 입력 안 패딩은 유지                                                                             |
| `/inquire/[id]`                   | page의 제목·본문·답변 각각 `mx-20`                                                                         | 페이지 관리. 별도 형제 영역 반복은 중첩 패딩이 아님                                                          |
| `/report`                         | page의 대상·내용·행동 영역 `m-20` 또는 `mx-20`                                                             | 페이지 관리. 입력 내부 `p-16`는 별도                                                                         |
| `/image-viewer`                   | 본문 좌우 여백 없이 이미지 contain                                                                         | 전체 이미지 표시 예외. 일반 본문 20px를 강제하지 않음                                                        |
| `/terms`                          | LegalDocumentRenderer 자체 `px-20`                                                                         | 정책 4개 페이지가 공유하는 문서 표현 컴포넌트에 페이지 여백 포함                                             |
| `/privacy-policy`                 | LegalDocumentRenderer 자체 `px-20`                                                                         | 위와 동일. 정책 페이지 셸로 책임 이동 후보                                                                   |
| `/privacy-collection-use`         | LegalDocumentRenderer 자체 `px-20`                                                                         | 위와 동일                                                                                                    |
| `/marketing-consent`              | LegalDocumentRenderer 자체 `px-20`                                                                         | 위와 동일                                                                                                    |
| `/login`                          | page의 안내·푸터 `px-20`, 소셜 버튼 그룹 추가 `px-16`                                                      | 버튼은 바깥에서 총 36px 들어감. 의도된 그룹 inset인지 시각 비교 후 결정                                      |
| `/agreements`                     | AgreementScreen의 main `px-20`                                                                             | 전용 화면 셸에서 관리. 카드 내부 16px는 중복 여백 아님                                                       |
| `/oauth/kakao`                    | Loading만 표시                                                                                             | 일반 본문 해당 없음                                                                                          |
| `/whiskey-mbti`                   | CSS module의 wrap `width: calc(100% - 28px)`                                                               | 좌우 14px인 독립 콘텐츠 예외                                                                                 |
| `/whiskey-tarot`                  | Intro·Questioning 등 단계 화면 `px-24`, 결과·카드 단계별 구성                                              | 독립 콘텐츠. 일반 본문 기준으로 일괄 변경하지 않음                                                           |
| `/error`                          | `Error page` 텍스트만 렌더링                                                                               | 본문 규격 없음. global-error/not-found와 별개 route                                                          |

## 2. 특히 구분해야 하는 사례

### 같은 20px가 여러 번 보여도 중복이 아닌 경우

- page가 두 개의 형제 section에 각각 `px-20`를 주면 두 영역의 정렬선을 맞추는 것이다. 합쳐서 40px가 되지 않는다.
- page 바깥 20px + 카드 안쪽 16px는 서로 다른 역할이다. 카드의 배경·테두리 바깥 정렬을 기준으로 판단한다.
- page에서 전달한 className을 자식이 적용하는 것은 호출자가 여백을 결정하는 방식이다. 자식 내부의 고정 `mx-20`와 구분한다.
- 이름이 List·Screen이어도 전체 화면을 조립하는 route 전용 컴포넌트는 페이지 셸 역할을 맡을 수 있다. 모든 스타일을 page.tsx 한 파일에 모을 필요는 없다.

### 음수 margin 보정

둘러보기는 부모가 20px 안쪽인데 검색 래퍼가 `-mx-16 px-16`다. 검색 내용 시작점은 `20 - 16 + 16 = 20px`로 맞지만 sticky 배경은 4px 안쪽에서 시작한다. 단순히 padding만 보고 36px 중복이라고 판단하면 안 된다. 배경을 전체 폭으로 펼칠지, 페이지 셸에서 검색 영역을 별도로 둘지 정리할 필요가 있다.

수입통관과 수입사도 각각 16px·20px 보정으로 차이가 있다. 현재 코드 확인 사항이며 스크롤 중 배경이 실제로 어떻게 보이는지는 수정 시 브라우저로 확인한다.

## 3. 소스 근거

- 홈: `src/components/feature/home/{MbtiPromoCard,HomeFeaturedSection,HomeCategorySection,HomeTabSection,HomeTastingEventPreview}.tsx`.
- 목록: `src/app/(primary)/explore/page.tsx`, `explore/_components/ExploreSearchBar.tsx`, `curation/page.tsx`, `import-clearance/_components/{ImportClearanceList,ImporterList,ImportClearanceFilter,ImporterFilter}.tsx`.
- 상세: `src/app/(primary)/review/[id]/_components/{ReviewDetails,ReviewUserHeader,ReviewPriceLocation,ReviewInteractionBar}.tsx`, 하위 `Reply/ReplyItemList.tsx`, `src/components/domain/alcohol/FlavorTags.tsx`.
- 검색·히스토리: `src/components/feature/Search/RecentSearch.tsx`, `src/components/domain/history/{TimelineFull,TimelinePreview}.tsx` 및 해당 page.
- 설정: `src/app/(primary)/settings/_components/{SettingsMainScreen,SettingsSubScreen,ThemeSettings,BlockManagement}.tsx`.
- 정책: `src/components/feature/legal/LegalDocumentRenderer.tsx`와 각 정책 page.
- 그 외 페이지: 표의 route에 대응하는 `src/app/(primary)` 또는 `src/app/(custom)`의 page와 전용 Screen.

## 4. 권장 진행 순서

1. 완료: 큐레이션 검색의 16px를 본문 20px 정렬선에 맞춤.
2. 둘러보기·수입통관 검색의 배경 확장과 바깥 여백 책임 정리.
3. 홈은 16/25px·전체 폭·가로 목록을 함께 비교한 뒤 페이지 셸 기준 확정.
4. 리뷰 상세·작성/수정·검색·히스토리의 분산된 여백 이관. 목표 외형은 유지하고 호출부·로딩 상태를 함께 확인.
5. 설정 24px를 20px로 조정하고 전용 화면 간 책임 통합. 정책 페이지도 공통 셸 책임을 명시.

사용자 합의 후 큐레이션 검색 여백을 20px로 반영했다. 나머지 후속 코드 변경은 아직 수행하지 않았다.
