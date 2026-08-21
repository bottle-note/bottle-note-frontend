# GTM 일괄 동기화

`gtm.config.json`을 기준으로 데이터 영역 변수, 맞춤 이벤트 트리거, GA4 이벤트 태그를 GTM 작업공간에 맞춘다. 같은 이름의 항목이 있으면 수정하고 없으면 생성한다.

## 인증 준비

1. Google Cloud 프로젝트에서 Tag Manager API를 활성화한다.
2. 서비스 계정을 만들고 JSON 키를 저장소 바깥에 내려받는다.
3. GTM 계정에 서비스 계정 이메일을 추가하고 컨테이너 수정 권한을 부여한다.
4. 터미널에 JSON 키 경로를 설정한다.

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/gtm-service-account.json
```

키 파일은 저장소에 복사하거나 커밋하지 않는다.

## 사용법

설정 파일만 검사한다.

```bash
pnpm gtm:validate
```

GTM과 비교하되 변경하지 않는다.

```bash
pnpm run gtm:sync -- --env dev
```

확인한 변경을 개발 작업공간에 반영한다.

```bash
pnpm run gtm:sync -- --env dev --apply
```

CLI는 작업공간까지만 변경하고 컨테이너를 게시하지 않는다. 적용 후 GTM 미리보기에서 이벤트와 매개변수를 확인하고 UI에서 게시한다.

운영 환경은 `GTM_PROD_GA4_MEASUREMENT_ID`를 설정한 뒤 `--env prod`를 사용한다. 운영 컨테이너의 작업공간이 여러 개라면 `gtm.config.json`의 `prod.workspaceId`도 지정한다.

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
