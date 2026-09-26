# 버튼 높이 조사

2026-09-26. `src/app`의 page.tsx 36개와 관련 컴포넌트를 Luna가 조사하고 주요 수치·사용처를 교차 확인했다. 테스트를 제외한 src TSX의 `<button>` 선언은 121곳이다. 선언 수는 렌더링되는 버튼 수가 아니며 미사용 컴포넌트와 조건부 표현도 포함한다.

정적 코드 기준이다. **고정**은 height 선언, **계산**은 한 줄 문구의 줄 높이·패딩·테두리 합, **자동**은 내용·상속·부모 배치에 따라 달라지는 경우다. 실제 브라우저 높이와 모든 동적 상태를 실측한 결과는 아니다. rem 기반 값은 기본 16px 기준이다.

## 공통 버튼

`src/components/ui/Button/Button.tsx:21`은 높이 52px 고정이다. size 속성이 없고 DualButton도 같은 Button 두 개를 사용한다. 조사한 사용처에는 높이를 덮어쓰는 클래스가 없으며 색·글자만 달라진다. StickyBottomCta의 버튼과 링크도 모두 52px다.

| 사용처                            | 높이    | 근거                                                                                             |
| --------------------------------- | ------- | ------------------------------------------------------------------------------------------------ |
| 리뷰 등록·수정                    | 고정 52 | `review/register/page.tsx:244`, `review/modify/page.tsx:144`                                     |
| 문의 작성·전송, 신고 전송         | 고정 52 | `inquire/page.tsx:90`, `inquire/register/page.tsx:206`, `report/page.tsx:183`                    |
| 가입 동의, 마케팅 동의·철회       | 고정 52 | `AgreementScreen.tsx:302`, `MarketingConsentSettings.tsx:173`                                    |
| 주류 리뷰 목록의 작성 버튼        | 고정 52 | `search/[category]/[id]/reviews/page.tsx:228`                                                    |
| 공통 알림·확인 모달, 로그인 안내  | 고정 52 | `ui/Modal/Modal.tsx:45`, `domain/auth/LoginModal.tsx:48`, `feature/auth/GuestLoginPrompt.tsx:37` |
| 별점 완료 모달                    | 고정 52 | `RatingSuccessModal.tsx:106`                                                                     |
| 큐레이션·수입 주류 상세 하단 행동 | 고정 52 | `ui/Layout/StickyBottomCta.tsx:23`, 링크 분기 `:25`                                              |

위 표의 page 경로는 `src/app/(primary)/` 기준이며 가입 화면은 `(custom)/agreements/_components/`, 나머지 공통 컴포넌트는 `src/components/` 아래다.

## 직접 만든 일반 행동 버튼

| 사용처                          | 높이         | 계산·근거                                                                                                     |
| ------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------- |
| 태그 추출·등록                  | 계산 29      | text-15 줄 높이 19 + 상하 패딩 8 + 테두리 2; `review/_components/form/ContentForm.tsx:81`, `TagsForm.tsx:106` |
| 팔로우·팔로잉                   | 계산 24      | text-10 줄 높이 14 + 패딩 8 + 테두리 2; `user/[id]/_components/FollowButton.tsx:40`                           |
| 프로필 수정                     | 계산 24      | 동일 조합; `user/[id]/_components/UserInfo.tsx:70`                                                            |
| 닉네임 변경                     | 계산 26      | text-12 줄 높이 16 + 패딩 8 + 테두리 2; `user/[id]/edit/_components/EditForm.tsx:117`                         |
| 차단 해제(설정)                 | 계산 26      | 16 + 8 + 2; `settings/_components/BlockManagement.tsx:102`                                                    |
| 장소 검색                       | 계산 36      | 부모 text-14 줄 높이 18 + 패딩 16 + 테두리 2; `review/_components/form/AddressForm.tsx:86`                    |
| 그래프로 풍미 기록하기          | 계산 44      | text-14 줄 높이 18 + 패딩 24 + 테두리 2; `review/_components/form/TastingNoteForm.tsx:50`                     |
| 주류 검색 오류 다시 시도        | 계산 33      | text-13 줄 높이 17 + 패딩 16; `review/_components/AlcoholSearchBottomSheet.tsx:180`                           |
| 주류 등록 요청                  | 계산 35      | 17 + 16 + 테두리 2; 같은 파일 `:191`                                                                          |
| 수입통관·수입사 목록 다시 시도  | 계산 35      | 17 + 16 + 2; `ImportClearanceList.tsx:218`, `ImporterList.tsx:143`                                            |
| 홈 추천 오류 다시 시도          | 계산 36      | 18 + 16 + 2; `src/components/feature/home/_components/HomeFeaturedErrorState.tsx:25`                          |
| 홈 추천 로그인                  | 계산 39      | text-16 줄 높이 20 + 패딩 17 + 테두리 2; `HomeFeaturedLoginRequired.tsx:25`                                   |
| 공통 오류 뒤로 가기 / 다시 시도 | 계산 35 / 33 | `src/components/ui/Display/ErrorFallback.tsx:31`, `:40`                                                       |
| 주류 상세 떠 있는 리뷰 작성     | 고정 52      | inline style height; `search/[category]/[id]/_components/FloatingReviewButton.tsx:21`                         |
| 소셜 로그인                     | 자동         | 높이 지정 없이 py-2.5, 문구 줄 높이 상속; `src/app/(custom)/login/_components/SocialLoginBtn.tsx:23`          |
| 댓글 등록                       | 자동         | py-1, 글자 속성 상속; `review/[id]/_components/Reply/ReplyForm.tsx:125`                                       |
| MBTI 시작·재시도·공유           | 자동         | CSS module의 font shorthand와 패딩으로 결정; `src/app/(custom)/whiskey-mbti/mbti.module.css:203`, `:484`      |
| 타로 시작·진행·공유             | 자동         | py-4 또는 py-3, 자식·상속 글자 속성에 따라 결정; `src/app/(custom)/whiskey-tarot/_components/`                |

계산값은 한 줄과 해당 선언의 기본 상태 기준이다. `label-*` 자체는 글자 크기를 정하지 않으므로 사용처의 `text-*`를 함께 확인해야 한다. 글자 설정은 `tailwind.config.ts:189`, label 패딩·경계는 `src/style/globals.css:205`에 있다.

## 일반 버튼 크기와 구분할 요소

| 유형                                | 현재 규격·판단             | 근거                                                                                                 |
| ----------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------- |
| 폴더 탭                             | 고정 32                    | `ui/Navigation/Tab/variants/BookmarkTab.tsx`의 TAB_HEIGHT                                            |
| 밑줄 기본 탭                        | 한 줄 계산 26.2            | 줄 높이 17.2 + 아래 패딩 8 + 아래 경계 1; `DefaultTab.tsx:16`                                        |
| 주류 상세 리뷰 목록 탭              | 한 줄 계산 36              | 줄 높이 19 + 패딩 16 + 아래 경계 1; 해당 reviews/page.tsx:124                                        |
| 필터 초기화                         | 계산 20                    | 줄 높이 14 + 패딩 4 + 경계 2; `feature/SideFilterDrawer/index.tsx:35`                                |
| 태그 더 보기                        | 고정 28                    | `review/_components/AlcoholInfo.tsx:243`                                                             |
| 태그 시트 닫기                      | 고정 44                    | 같은 파일 `:267`                                                                                     |
| 위스키 선택 이미지                  | 고정 171                   | 같은 파일 `:45`; 변경 버튼은 이미지 전체를 덮음. 내부 h-9 문구 띠의 36px를 버튼 높이로 해석하지 않음 |
| 사진 추가                           | 고정 3.8rem(60.8px)        | `ui/Form/ImageUploader.tsx:132`                                                                      |
| 홈 배너 제어                        | 고정 35.56                 | `feature/home/HomeCarousel.tsx:282`, `:294`                                                          |
| 공개 여부 토글                      | 고정 16                    | `ui/Form/Toggle.tsx:20`                                                                              |
| 하단 메뉴·설정 행·선택 칩·찜·좋아요 | 내용·부모 배치별           | 일반 CTA와 별도 규격으로 취급                                                                        |
| PrimaryLinkButton                   | 부모·내용에 따른 자동 높이 | `ui/Button/PrimaryLinkButton.tsx:44`; 카테고리 탐색 카드 링크                                        |

## 페이지별 확인 범위

공통 헤더·하단 메뉴·전역 모달은 위 공통 요소를 참조한다. 다음 표는 페이지 고유 일반 행동과 연결된 구성요소를 요약한다. ‘없음’은 페이지 고유 일반 행동 버튼이 없다는 뜻이다.

| 경로                              | 확인한 행동·구성요소                                                                      |
| --------------------------------- | ----------------------------------------------------------------------------------------- |
| `/`                               | 홈 추천 로그인 39·재시도 36, 배너 제어, 프로모션·카테고리 카드 링크                       |
| `/agreements`                     | AgreementScreen 제출 52, 동의 선택 요소                                                   |
| `/login`                          | SocialLoginBtn 자동 높이                                                                  |
| `/oauth/kakao`                    | 로딩 화면, 없음                                                                           |
| `/whiskey-mbti`                   | 시작·질문·결과 컴포넌트의 CSS module 버튼, 선택 카드 별도                                 |
| `/whiskey-tarot`                  | Intro·Questioning·CardSelection·ResultSlides·FinalResult의 자동 높이 버튼, 카드 선택 별도 |
| `/error`                          | 없음; src/app/global-error.tsx 재시도는 별도 계산 33                                      |
| `/explore`                        | 검색·필터·탭, 리뷰·주류 목록의 반응·메뉴·찜                                               |
| `/curation`                       | 검색·필터·탭, 콘텐츠 카드 링크                                                            |
| `/curation/[id]`                  | StickyBottomCta 52, 콘텐츠 유형별 링크                                                    |
| `/history`                        | 검색·필터·타임라인; HistoryEmptyState는 문구 표시                                         |
| `/image-viewer`                   | 뒤로 가기 등 탐색 요소                                                                    |
| `/import-clearance`               | 두 목록의 재시도 35, 필터·정렬·목록 이동                                                  |
| `/import-clearance/alcohol/[id]`  | 조건부 StickyBottomCta 52, 전체 수입 내역 링크(한 줄 계산 32), LoginGate                  |
| `/import-clearance/importer/[id]` | 텍스트 재시도 자동 높이, LoginGate·목록 이동                                              |
| `/inquire`                        | 문의 작성 52, 목록 이동                                                                   |
| `/inquire/register`               | 전송 52, 첨부 요소                                                                        |
| `/inquire/[id]`                   | 상세·첨부·뒤로 가기, 별도 제출 없음                                                       |
| `/report`                         | 전송 52, 신고 대상 선택                                                                   |
| `/review/register`                | 제출 52, 태그 29, 장소 36, 풍미 기록 44, 검색 시트 33/35                                  |
| `/review/modify`                  | 제출 52, ReviewForm 공유(태그·장소·풍미 기록 등)                                          |
| `/review/[id]`                    | 댓글 등록 자동, 리뷰 작성 텍스트 행동, 좋아요·댓글·메뉴                                   |
| `/search`                         | 검색 링크·카테고리 카드·선택 요소                                                         |
| `/search/input`                   | 검색·최근 검색 선택, 전체 기록 삭제 텍스트 행동                                           |
| `/search/[category]/[id]`         | FloatingReviewButton 52, 별점 완료 확인 52, 찜·별점·리뷰 메뉴                             |
| `/search/[category]/[id]/reviews` | 작성 52, 탭 36, 리뷰 메뉴                                                                 |
| `/settings`                       | 설정 메뉴·테마 선택·차단 해제 26 등 내부 화면                                             |
| `/settings/marketing-consent`     | 동의·철회 52, 텍스트 재시도                                                               |
| `/user/[id]`                      | 팔로우 24, 프로필 수정 24, 통계 이동·카테고리 링크                                        |
| `/user/[id]/edit`                 | 닉네임 변경 26, 이미지·닉네임 초기화 요소                                                 |
| `/user/[id]/follow`               | FollowerListItem의 팔로우 24, 탭                                                          |
| `/user/[id]/my-bottle`            | 탭·검색·정렬, 기록별 반응·찜·메뉴                                                         |
| `/terms`                          | LegalDocumentRenderer, 본문 링크·헤더                                                     |
| `/privacy-policy`                 | LegalDocumentRenderer, 본문 링크·헤더                                                     |
| `/privacy-collection-use`         | LegalDocumentRenderer, 본문 링크·헤더                                                     |
| `/marketing-consent`              | LegalDocumentRenderer, 본문 링크·헤더                                                     |

## 28·40·52px 기준과의 관계

- Large 52px는 기존 공통 Button·하단 CTA·떠 있는 리뷰 작성 버튼과 일치한다.
- Small 28px는 현재 24·26·29px 일반 행동 버튼을 검토할 기준이다. 자동으로 일괄 변경하지 않는다.
- Medium 40px는 현재 33·35·36·39·44px의 콘텐츠 내 일반 행동 버튼을 검토할 기준이다. 소셜 로그인 등 별도 표현도 사용 맥락을 확인한다.
- 탭·선택 칩·이미지 선택·내비게이션·카드 링크는 S/M/L에 일괄 포함하지 않는다.
- 명시적 높이를 도입할 때 같은 높이에 패딩·경계를 추가하지 않고 border-box 전체 높이를 기준으로 한다. 긴 문구·여러 줄 콘텐츠는 별도 배치를 결정한다.
