# Agent Instructions

## Browser Debugging

- Use the Playwright MCP for browser-based debugging and local UI verification in this workspace.
- Do not substitute another browser-control tool or standalone browser automation when the Playwright MCP is available.
- If the flow requires authentication, do not bypass or mock it. Ask the user to sign in, then resume after the user confirms that login is complete.
- Reuse the authenticated Playwright MCP browser session for subsequent checks.
- Reproduce issues at the viewport size and document scroll height reported by the user.
- For infinite-scroll debugging, compare network requests before scrolling with requests made after the sentinel enters the viewport.
