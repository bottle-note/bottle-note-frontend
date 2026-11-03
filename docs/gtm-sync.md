# GTM 일괄 동기화

`gtm.config.json`을 기준으로 데이터 영역 변수, 맞춤 이벤트 트리거, GA4 이벤트 태그를 GTM 작업공간에 맞춘다. 같은 이름의 항목이 있으면 수정하고 없으면 생성한다.

## 배포 흐름

`main`에 `gtm.config.json`, `scripts/gtm-sync.mjs`, `.github/workflows/gtm_sync.yml` 변경이 머지되면 GitHub Actions의 GTM Sync가 실행된다. Actions 화면에서 수동으로 실행할 수도 있다.

| 환경 | 컨테이너       | CI 동작                             | 게시                                          |
| ---- | -------------- | ----------------------------------- | --------------------------------------------- |
| dev  | `GTM-M4MMS6DR` | 작업공간 반영 후 버전을 만들어 게시 | 자동                                          |
| prod | `GTM-TVSGX863` | 작업공간 반영만                     | 릴리스할 때 GTM 화면에서 변경을 확인하고 게시 |

prod는 `gtm.config.json`에 `allowPublish`가 없으므로 CLI가 게시를 거부한다. 태그는 코드보다 먼저 게시해도 이벤트가 오기 전까지 동작하지 않으므로, 릴리스 직전에 게시하면 배포 직후부터 수집된다.

버전 이름은 `YYYY-MM-DD 요약` 형식을 쓰고, 설명에 관련 PR이나 커밋을 남긴다. 문제가 생기면 GTM 버전 탭에서 이전 버전을 다시 게시해 되돌린다.

## 인증

서비스 계정 `gtm-sync@bottle-note-442412.iam.gserviceaccount.com`을 쓰며 키 파일은 만들지 않는다.

- GTM 권한: dev 컨테이너 게시, prod 컨테이너 수정
- CI: Workload Identity Federation(`github` 풀의 `bottle-note-frontend` 공급자). `bottle-note/bottle-note-frontend` 저장소의 `main` 실행만 서비스 계정을 쓸 수 있다.
- 로컬: 서비스 계정 토큰 생성자 권한이 있는 계정으로 대행 인증한다.

```bash
gcloud auth application-default login \
  --impersonate-service-account=gtm-sync@bottle-note-442412.iam.gserviceaccount.com
```

## 로컬 사용법

설정 파일만 검사한다.

```bash
pnpm gtm:validate
```

GTM과 비교하되 변경하지 않는다.

```bash
pnpm run gtm:sync -- --env dev
```

확인한 변경을 작업공간에 반영한다.

```bash
pnpm run gtm:sync -- --env dev --apply
```

dev는 반영 후 바로 게시할 수 있다. CI가 같은 명령을 쓴다.

```bash
pnpm run gtm:sync -- --env dev --publish --version-name "2026-10-24 요약"
```

운영 측정 ID는 `gtm.config.json`의 `prod.measurementId`에 설정한다. 운영 컨테이너의 작업공간이 여러 개라면 `gtm.config.json`의 `prod.workspaceId`도 지정한다. 운영 페이지에서 GTM 스크립트가 로드되는 것과 GA4 태그가 컨테이너에 게시된 것은 별개로 확인한다.

## 리뷰·검색 이벤트 기준

| 이벤트                  | 발화 조건                                | 매개변수                        | 중복 방지                    |
| ----------------------- | ---------------------------------------- | ------------------------------- | ---------------------------- |
| `write_review_start`    | 새 리뷰 폼을 처음 수정한 시점            | `alcohol_id`                    | 작성 화면당 1회              |
| `write_review_complete` | 새 리뷰 저장 성공                        | `alcohol_id`                    | 저장 성공 응답 뒤 1회        |
| `write_review_failed`   | 이미지 업로드, 별점 저장, 리뷰 저장 실패 | `alcohol_id`, `failure_type`    | 실패한 단계에서 1회          |
| `search`                | 검색어의 첫 결과 페이지 수신             | `result_count`, `query_length`  | 검색어당 1회                 |
| `search_result_click`   | 검색 결과의 주류 상세 링크 선택          | `alcohol_id`, `result_position` | 사용자 클릭 시 1회           |
| `search_no_results`     | 검색어의 첫 결과가 0건                   | `query_length`                  | `search`와 함께 검색어당 1회 |

위 맞춤 이벤트의 매개변수에는 검색어 원문을 넣지 않고 길이만 넣는다.

## 수입통관 이벤트 기준

| 이벤트                            | 발화 조건                             | 매개변수                                         | 중복 방지       |
| --------------------------------- | ------------------------------------- | ------------------------------------------------ | --------------- |
| `view_import_clearance_list`      | 첫 목록 페이지 수신 및 인증 상태 확정 | `access_state`, `result_state`                   | 화면 진입당 1회 |
| `select_import_clearance`         | 목록 또는 관련 수입 내역 링크 선택    | `declaration_id`, `source`                       | 클릭당 1회      |
| `view_import_clearance_detail`    | 상세 응답 수신 및 인증 상태 확정      | `declaration_id`, `access_state`, `match_status` | 신고 ID당 1회   |
| `select_import_clearance_alcohol` | 매칭 요약 링크 또는 하단 CTA 선택     | `declaration_id`, `alcohol_id`, `source`         | 클릭당 1회      |

`declaration_id`는 수입 신고 레코드 ID이며 `alcohol_id`와 다르다. GA4 맞춤 측정기준에는 `access_state`, `result_state`, `match_status`, `source`처럼 값이 제한된 항목만 등록한다.

## 로그인 게이트 이벤트 기준

| 이벤트                 | 발화 조건                                              | 매개변수                         | 중복 방지                                |
| ---------------------- | ------------------------------------------------------ | -------------------------------- | ---------------------------------------- |
| `login_gate_page_view` | 인증 상태가 게스트로 확정되고 게이트가 렌더된 시점     | `gate_page`                      | 게이트 마운트당 1회                      |
| `login_gate_reach`     | 게이트 요소가 뷰포트에 처음 들어온 시점                | `gate_page`                      | 게이트 마운트당 1회                      |
| `login_gate_click`     | 게이트의 로그인 CTA 선택                               | `gate_page`                      | 클릭당 1회                               |
| `login`                | 로그인 성공. 게이트를 거쳤으면 `gate_page`를 함께 전송 | `method`, `trigger`, `gate_page` | 로그인 성공 뒤 1회, 유도 컨텍스트는 소비 |

목록 게이트는 필터·검색 조건이 바뀌면 다시 마운트되므로 이벤트 수가 아닌 사용자·세션 기준 유입경로로 비교한다. `gate_page`는 값이 제한된 항목이므로 GA4 맞춤 측정기준으로 등록한다.

## 바텐더 노트 이벤트 기준

| 이벤트                            | 발화 조건                                                             | 매개변수                | 중복 방지                     |
| --------------------------------- | --------------------------------------------------------------------- | ----------------------- | ----------------------------- |
| `bartender_start`                 | 첫 화면에서 추천·상황별·리뷰·찜 흐름을 시작                           | `entry`                 | 선택당 1회                    |
| `bartender_recommend_result`      | 취향 추천 결과(첫 잔 또는 목록)나 큐레이션 목록을 처음 보는 시점      | `mode`, `result_state`  | 같은 답변·큐레이션 결과당 1회 |
| `bartender_select_alcohol`        | 추천 목록·큐레이션·찜에서 술을 골라 바텐더 상세로 이동                | `alcohol_id`, `source`  | 선택당 1회                    |
| `bartender_open_alcohol_page`     | 바텐더 상세나 찜에서 실제 술 상세 페이지로 이동                       | `alcohol_id`, `source`  | 클릭당 1회                    |
| `bartender_show_other_candidates` | 첫 잔 대화에서 「다른 술도 보여주세요」 선택                          | 없음                    | 클릭당 1회                    |
| `bartender_story_start`           | 술 이야기를 「들려주세요」, 「이야기 듣기」 또는 「다시 듣기」로 시작 | `alcohol_id`, `trigger` | 클릭당 1회                    |
| `bartender_story_complete`        | 첫 문단의 마지막 문장 말풍선까지 들음                                 | `alcohol_id`            | 들려주기 1회당 1회            |
| `bartender_story_skip`            | 「다음에요」(제안) 또는 「그만 들을게요」(이야기 중) 선택             | `alcohol_id`, `stage`   | 클릭당 1회                    |
| `bartender_story_full_text`       | 「전체 글 보기」로 설명 전체 시트를 엶                                | `alcohol_id`            | 클릭당 1회                    |

첫 잔은 상세와 같은 화면이라 건네는 것만으로 `bartender_select_alcohol`을 보내지 않는다. 첫 잔에서 바로 행동한 비율은 결과 이벤트 대비 `write_review_start`·`bartender_open_alcohol_page`·`add_to_picks`와 `bartender_show_other_candidates`를 함께 본다. 비로그인 사용자가 다른 후보를 누르면 `bartender_show_other_candidates` 뒤에 `login_prompt_shown`(`trigger: other_candidates`)이 나가고, 로그인하면 후보 목록이 열린다. 이야기는 첫 잔과 모든 바텐더 상세에서 설명이 있는 술에만 제안하므로, 제안 수는 결과 이벤트 수와 같지 않다. GA4 맞춤 측정기준에는 `entry`, `mode`, `result_state`, `source`, `trigger`, `stage`처럼 값이 제한된 항목만 등록하고 `alcohol_id`는 등록하지 않는다.

### 리뷰 유입 경로와 캠페인 집계

바텐더 노트의 `write_review_start`·`write_review_complete`·`write_review_failed`는 기존 `source: bartender_note`에 `entry_flow`를 함께 보낸다. 바텐더 밖의 기존 리뷰 작성 이벤트에는 경로 값을 추가하지 않는다. GTM 데이터 영역에 이전 값이 남아 일반 리뷰로 섞이지 않도록, 리뷰 이벤트 전달 시 없는 `source`·`entry_flow`는 `null`로 명시적으로 비운다.

- `direct`: 첫 화면의 리뷰 메뉴 또는 등록 완료 후 「다른 술도 기록할게요」에서 시작한 리뷰.
- `recommend`: 추천 첫 잔 또는 다른 추천 후보에서 이어 쓴 리뷰.
- `curation`: 큐레이션의 술 상세에서 이어 쓴 리뷰.
- `picks`: 찜한 술의 상세에서 이어 쓴 리뷰.

리뷰 작성 방식(한 줄·노즈/팔레트/피니시)을 고르면 `write_review_start`, 리뷰 저장이 성공하면 `write_review_complete`, 이미지 업로드·리뷰 저장·별점 저장이 실패하면 해당 `failure_type`의 `write_review_failed`를 보낸다. 경로는 리뷰 시도와 함께 보존해 로그인 왕복·새로고침·저장 재시도 후에도 유지한다. 별점만 저장에 실패한 경우 리뷰 자체는 성공이므로 완료와 별점 실패를 함께 보낸다.

어드민 캠페인과 GA4는 별도 측정이다. `bartender-note-review`의 `START`는 리뷰 메뉴 또는 술 상세의 리뷰 작성 선택(로그인 안내 전), `FINISH`는 미리보기 도달, `RESULT`는 실제 리뷰 저장 성공이다. 추천·큐레이션·찜에서 이어 쓴 리뷰도 포함하며, 원래 추천·큐레이션 시도는 보존한다. 같은 술의 리뷰에 돌아오거나 새로고침해도 동일 시도의 완료·결과를 추가로 보내지 않고, 다른 술의 리뷰나 「다른 술도 기록할게요」는 새 시도로 센다. 추천 `RESULT`는 다른 후보 목록 열람, 큐레이션 `RESULT`는 술 상세 열람이라는 기존 의미를 유지한다.

리뷰 캠페인은 이 변경 적용 뒤 직접 리뷰 진입뿐 아니라 모든 바텐더 리뷰 경로를 포함한다. 적용 전후 집계 범위가 다르므로 과거 수치를 같은 모집단으로 비교하지 않는다. 기존 데이터는 소급 변경하지 않는다.

`entry_flow`는 값이 제한된 이벤트 범위 맞춤 측정기준으로 GA4에 별도 등록해야 경로별 보고에 사용할 수 있다. 이 PR의 `gtm.config.json` 변경은 세 리뷰 이벤트의 전달 매개변수 정의이며, PR 생성만으로 GTM 게시나 GA4 맞춤 측정기준 등록이 완료되는 것은 아니다. 병합 뒤 위 배포 흐름에 따라 GTM 반영·게시와 GA4 수신을 각각 확인한다.

## 홈 이벤트 기준

| 이벤트                  | 발화 조건                                                                             | 매개변수                         | 중복 방지  |
| ----------------------- | ------------------------------------------------------------------------------------- | -------------------------------- | ---------- |
| `home_quick_link_click` | 배너 아래 바로가기 선택                                                               | `link`                           | 클릭당 1회 |
| `home_item_click`       | 홈 섹션 항목(주간 TOP 5, 최근 본 위스키, 에디터 추천, 카테고리, 국가·지역, 리뷰) 선택 | `section`, `item_id`, `position` | 클릭당 1회 |
| `home_more_click`       | 섹션의 「전체 보기」 선택                                                             | `section`                        | 클릭당 1회 |
| `add_to_picks`          | 홈 목록에서 찜 추가·취소                                                              | 기존 매개변수 + `source: home`   | 클릭당 1회 |
| `header_search_click`   | 상단 바 검색 아이콘 선택(홈·둘러보기·마이페이지 상단 바)                              | 없음                             | 클릭당 1회 |

`link`는 `bartender_note`·`whisky_search`·`review_write`·`my_records`, `section`은 `weekly_top`·`recent_viewed`·`curation`·`category`·`region`·`review`다. `item_id`는 섹션에 따라 주류 ID, 큐레이션 ID, 카테고리 영문명, 지역 ID, 리뷰 ID다. 국가별 보기의 `position`은 나라 행 순서이며 하위 지역 칩을 눌러도 그 나라의 순서를 보낸다. `position`은 섹션 안에서 1부터 센다. GA4 맞춤 측정기준에는 `link`, `section`만 등록하고 `item_id`는 등록하지 않는다.
