# Agent Instructions

## Browser Debugging

- Use the Playwright MCP for browser-based debugging and local UI verification in this workspace.
- Do not substitute another browser-control tool or standalone browser automation when the Playwright MCP is available.
- If the flow requires authentication, do not bypass or mock it. Ask the user to sign in, then resume after the user confirms that login is complete.
- Reuse the authenticated Playwright MCP browser session for subsequent checks.
- Reproduce issues at the viewport size and document scroll height reported by the user.
- For infinite-scroll debugging, compare network requests before scrolling with requests made after the sentinel enters the viewport.

## Pull Requests

- Bottle Note 제품 이슈의 원본 저장소는 `bottle-note/workspace`입니다.
- PR을 열기 전에 `gh issue view <번호> --repo bottle-note/workspace`로 원본 이슈의 제목, 범위, 라벨 및 완료 조건을 확인합니다.
- 이슈 번호를 모르면 `bottle-note/workspace`에서 현재 사용자에게 할당된 프론트엔드 이슈를 먼저 검색합니다.
- PR 본문에는 교차 저장소 참조를 사용합니다. 이슈를 종료할 때는 `Closes bottle-note/workspace#<번호>`로 작성합니다.
- `Closes #<번호>`는 `bottle-note-frontend` 저장소의 이슈로 해석되므로 사용하지 않습니다.
- 백엔드·기획 등 다른 영역의 의존성이 있는 이슈는 PR 참고사항에 구현 범위와 후속 작업을 구분해 기록합니다.
