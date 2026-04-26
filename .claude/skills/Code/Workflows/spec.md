Write a spec for $ARGUMENTS before any implementation.

(If no arguments, ask what we're building.)

Usage:

- `/spec 위스키 검색 필터` - 특정 기능의 스펙 작성
- `/spec` - 대화형으로 무엇을 만들지 정의

---

## Process

### Step 1: Surface Assumptions

Before writing anything, list what you're assuming and ask the user to confirm:

```
ASSUMPTIONS:
1. This targets the existing Next.js App Router structure
2. API endpoint already exists (or needs to be created)
3. Auth is required for this feature
4. Mobile-first responsive design
→ Correct me now or I'll proceed with these.
```

Don't silently fill in ambiguous requirements. The spec's purpose is to surface misunderstandings before code gets written.

### Step 2: Write the Spec

Cover these core areas:

```markdown
# Spec: [Feature Name]

## Objective
What we're building and why. User-facing behavior description.

## Success Criteria
Specific, testable conditions that define "done":
- [ ] Criterion 1
- [ ] Criterion 2

## Scope
### In Scope
- ...
### Out of Scope
- ...

## Technical Approach
- Components to create/modify
- API endpoints involved
- State management approach (TanStack Query / Zustand)
- Key decisions and their rationale

## Boundaries
- **Always:** Run tests, follow naming conventions, validate inputs
- **Ask first:** Adding dependencies, schema changes, new API calls
- **Never:** Skip type safety, commit secrets, remove existing tests

## Open Questions
Anything unresolved that needs human input.
```

### Step 3: Reframe Vague Requirements

Translate vague requests into concrete conditions:

```
REQUIREMENT: "Make the list page better"

REFRAMED SUCCESS CRITERIA:
- List loads within 500ms on 4G
- Infinite scroll with skeleton loading
- Empty state when no results
- Filter state persisted in URL params
→ Are these the right targets?
```

### Step 4: Break into Tasks

Once spec is approved, decompose into implementable tasks:

```markdown
- [ ] Task: [Description]
  - Acceptance: [What must be true when done]
  - Verify: [How to confirm — test, build, manual check]
  - Files: [Which files will be touched]
```

Rules:
- Each task completable in a single focused session
- Each task has explicit acceptance criteria
- No task should require changing more than ~5 files
- Tasks ordered by dependency, not by importance

---

## Gated Workflow

Do NOT advance to the next phase until the current one is validated by the user.

```
SPECIFY → PLAN → TASKS → IMPLEMENT
   ↓        ↓      ↓        ↓
 User     User   User     User
 reviews  reviews reviews  reviews
```

## Rationalizations to Reject

| Rationalization | Reality |
|---|---|
| "This is simple, I don't need a spec" | Simple tasks don't need long specs, but they still need acceptance criteria |
| "I'll write the spec after I code it" | That's documentation, not specification. The value is clarity before code |
| "The spec will slow us down" | A 15-minute spec prevents hours of rework |
| "Requirements will change anyway" | That's why the spec is a living document |

## Red Flags

- Starting to write code without any written requirements
- Implementing features not mentioned in any spec
- Making architectural decisions without documenting them
- Skipping the spec because "it's obvious what to build"
