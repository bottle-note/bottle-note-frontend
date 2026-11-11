# Bottle Note Frontend Agent Guide

## 1. 제품 맥락

- Bottle Note는 사용자가 주류를 탐색하고 별점·리뷰를 기록하며 취향을 공유하는 사용자용 프로덕트다. 현재 콘텐츠는 위스키 중심이며, 관리자용 화면의 작업 흐름이나 UI 기준을 그대로 적용하지 않는다.
- Next.js App Router, React, TypeScript, Tailwind CSS, pnpm을 쓴다. 실행 명령은 `package.json`을 따른다.
- 모바일 우선이며 일반 브라우저와 Flutter WebView 양쪽에서 동작한다.
- 핵심 도메인은 주류 탐색, 별점, 리뷰, 찜(`pick`), 댓글, 팔로우, 마이보틀, 큐레이션, 테이스팅 이벤트·프로그램이다.
- 별점은 0.5점부터 5점까지 0.5점 단위다. 리뷰는 공개/비공개 상태와 병(`BOTTLE`)/잔(`GLASS`) 가격, 장소, 이미지, 테이스팅 태그를 포함할 수 있다. 마이보틀은 사용자의 별점·리뷰·찜 기록을 모아 보는 영역이다.

## 2. 기능 작업 흐름

1. `.agents/skills/quality-scenarios/SKILL.md`로 기능·품질 시나리오와 합격 기준을 도출하고, 사람과 조율해 확정한다.
2. 확정된 합격 기준을 목표로 테스트와 코드를 작성한다. 설계 결정은 근거가 된 품질 시나리오 번호를 단다.
3. PR 전에 구현과 분리된 세션에서 `.agents/skills/quality-gate/SKILL.md`로 검증하고, 결과를 PR 본문에 남긴다.
4. 코드로 복원되지 않는 설계 결정은 `adr/README.md` 규칙으로 ADR을 남긴다.

문구·스타일 수정이나 작은 버그 수정처럼 사용자 흐름이 바뀌지 않는 작업은 이 흐름을 생략하고, 재현된 버그에는 회귀 테스트를 남긴다.

## 3. 프로젝트 규칙

- 화면 전용 코드는 route의 `_components`에 두는 것을 출발점으로 삼는다. 재사용 범위에 따라 도메인 로직은 `domain`, 도메인 독립 기능은 `feature`, 기본 UI 요소는 `ui`에 둔다.
- UI 작업은 `DESIGN.md`, `tailwind.config.ts`, 인접한 기존 컴포넌트를 확인한다.
- 화면 처리 방향, 레이아웃 선택지, 상태별 화면을 제안할 때는 ASCII나 마크다운 표 대신 사용자가 열어 볼 수 있는 시각 시안으로 전달한다. 디자인·아티팩트 도구를 우선 쓰고, 없으면 HTML 파일을 만들어 브라우저로 연다.
- API 작업 전 [Product API OpenAPI 문서](https://docs.bottle-note.com/#product)에서 경로, 메서드, 인증 여부와 요청·응답 스키마를 확인한다. 스펙에 없는 필드, 기본값, 성공·오류 동작은 추측하지 않고 차이를 드러낸다.
- GA4 이벤트와 GTM 설정을 변경할 때는 `.agents/skills/bottle-note-ga4/SKILL.md`를 따른다.

## 4. 완료와 전달

- Product UI PR에는 프리뷰 라벨을 기본으로 추가하지 않는다. 프리뷰가 명시적으로 요청된 경우에만 내부 서버 또는 공유 K8s Preview 중 방식을 먼저 확인한다.
- 공유 K8s Preview는 `preview-deploy` 라벨과 `https://preview.development.bottle-note.com/`을 사용한다. 공유 환경의 소유 PR은 하나이므로, 기존 소유 PR을 확인하고 사용자 승인 없이 라벨을 이동하지 않는다.
- 실행하지 않은 검증을 통과했다고 보고하지 않는다.
- PR 설명은 템플릿의 소제목 구조를 유지하고 각 섹션을 짧은 불렛으로 쓴다. 스크린샷은 접지 않고 본문에 표시한다.
- 화면이 바뀌는 PR은 변경사항 섹션에 스크린샷을 넣는다. 한 화면의 스크린샷이 3장 이상이면 GIF 하나로 합쳐 올린다.
- Bottle Note 제품 이슈의 원본 저장소는 `bottle-note/workspace`다. PR 전 `gh issue view <번호> --repo bottle-note/workspace`로 제목, 범위, 라벨, 완료 조건을 확인한다. 번호를 모르면 그 저장소에서 현재 사용자에게 할당된 프론트엔드 이슈를 찾는다.
- PR에는 관련 이슈를 `https://github.com/bottle-note/workspace/issues/<번호>`처럼 URL만 그대로 적는다. 대괄호를 쓰는 Markdown 링크 형식과 이슈를 자동 종료하는 키워드는 사용하지 않는다.
