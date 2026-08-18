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
