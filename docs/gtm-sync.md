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

첫 잔은 상세와 같은 화면이라 건네는 것만으로 `bartender_select_alcohol`을 보내지 않는다. 첫 잔에서 바로 행동한 비율은 결과 이벤트 대비 `write_review_start`·`bartender_open_alcohol_page`·`add_to_picks`와 `bartender_show_other_candidates`를 함께 본다. 이야기는 첫 잔과 모든 바텐더 상세에서 설명이 있는 술에만 제안하므로, 제안 수는 결과 이벤트 수와 같지 않다. GA4 맞춤 측정기준에는 `entry`, `mode`, `result_state`, `source`, `trigger`, `stage`처럼 값이 제한된 항목만 등록하고 `alcohol_id`는 등록하지 않는다.

## 홈 이벤트 기준

| 이벤트                  | 발화 조건                                       | 매개변수                         | 중복 방지  |
| ----------------------- | ----------------------------------------------- | -------------------------------- | ---------- |
| `home_quick_link_click` | 배너 아래 바로가기 선택                         | `link`                           | 클릭당 1회 |
| `home_item_click`       | 홈 섹션의 항목(주간 TOP 5, 최근 본 위스키) 선택 | `section`, `item_id`, `position` | 클릭당 1회 |
| `add_to_picks`          | 홈 목록에서 찜 추가·취소                        | 기존 매개변수 + `source: home`   | 클릭당 1회 |

`link`는 `bartender_note`·`taste_test`·`tarot`·`my_records`, `section`은 `weekly_top`·`recent_viewed`이며 큐레이션·리뷰·둘러보기 섹션이 붙으면 같은 이벤트에 값을 더한다. `position`은 섹션 안에서 1부터 센다. GA4 맞춤 측정기준에는 `link`, `section`만 등록하고 `item_id`는 등록하지 않는다.
