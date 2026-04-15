Review $ARGUMENTS.

(If no arguments, review the current working code.)

Usage:

- `/review` - 현재 작업 중인 코드 리뷰
- `/review src/hooks/useToast.ts` - 특정 파일 리뷰
- `/review useModalStore` - 특정 함수/클래스 리뷰

---

## Process

### Step 1: Understand Context

Before looking at code, understand the intent:

- What is this change trying to accomplish?
- What spec or task does it implement?
- What is the expected behavior change?

### Step 2: Review Tests First

Tests reveal intent and coverage:

- Do tests exist for the change?
- Do they test behavior (not implementation details)?
- Are edge cases covered?
- Would the tests catch a regression if the code changed?

### Step 3: Five-Axis Review

For each file changed, evaluate:

**1. Correctness**
- Does it match the spec/task requirements?
- Are edge cases handled (null, empty, boundary)?
- Are error paths handled (not just the happy path)?

**2. Readability**
- Are names descriptive and consistent with project conventions?
- Is the control flow straightforward (no nested ternaries, deep callbacks)?
- Are abstractions earning their complexity?
- Dead code artifacts: no-op variables, backwards-compat shims, `// removed` comments?

**3. Architecture**
- Does it follow existing patterns or introduce a new one? If new, is it justified?
- Clean module boundaries maintained?
- Dependencies flowing in the right direction (no circular)?

**4. Security**
- User input validated and sanitized?
- Secrets out of code, logs, and version control?
- Outputs encoded to prevent XSS?
- External data treated as untrusted?

**5. Performance**
- Unnecessary re-renders in UI components?
- N+1 query patterns?
- Unbounded loops or unconstrained data fetching?
- Missing pagination on list endpoints?

### Step 4: Label Every Finding

| Prefix | Meaning | Author Action |
|---|---|---|
| **Critical:** | Blocks merge — security, data loss, broken functionality | Must fix |
| *(no prefix)* | Required change | Must address before merge |
| **Nit:** | Minor, optional — formatting, style | May ignore |
| **Optional:** | Suggestion worth considering | Not required |
| **FYI** | Informational context | No action needed |

### Step 5: Verify the Verification

- What tests were run?
- Did the build pass?
- Was the change tested manually?
- Are there screenshots for UI changes?

---

## Change Sizing

```
~100 lines  → Good. Reviewable in one sitting.
~300 lines  → Acceptable if single logical change.
~1000 lines → Too large. Split it.
```

If a change is too large, ask the author to split before reviewing.

## Rationalizations to Reject

| Rationalization | Reality |
|---|---|
| "It works, that's good enough" | Working but unreadable/insecure code creates compounding debt |
| "The tests pass, so it's good" | Tests don't catch architecture problems, security issues, or readability concerns |
| "AI-generated code is probably fine" | AI code needs more scrutiny, not less — confident and plausible, even when wrong |
| "We'll clean it up later" | Later never comes. The review is the quality gate |
| "I wrote it, so I know it's correct" | Authors are blind to their own assumptions |

## Red Flags

- PRs merged without any review
- "LGTM" without evidence of actual review
- Security-sensitive changes without security-focused review
- Large PRs that are "too big to review properly" — split them
- No regression tests with bug fix PRs
- Accepting "I'll fix it later"
