Refactor $ARGUMENTS.

(If no arguments, refactor the current file.)

Usage:

- `/refactor` - 현재 파일 리팩토링
- `/refactor useAuth` - 특정 훅 리팩토링
- `/refactor src/store/modalStore.ts` - 특정 파일 리팩토링

---

## Process

### Step 1: Understand Before Touching (Chesterton's Fence)

If you see a fence and don't understand why it's there, don't tear it down. Before modifying code, answer:

- What is this code's responsibility?
- What calls it and what does it call?
- What edge cases and error paths exist?
- Are there tests defining expected behavior?
- What does git blame reveal about the original intent?

**If you can't answer these, don't refactor. Investigate first.**

### Step 2: Identify Opportunities

**Structural complexity:**
- 3+ levels of nesting → flatten with guard clauses / early returns
- 50+ line functions → split by semantic units
- Nested ternaries → if/else or lookup objects
- Boolean parameter flags → options object or separate functions

**Naming & readability:**
- Generic names (data, result, temp, item) → descriptive names
- Abbreviations → spell out (except universal: id, url, api)
- "What" comments → remove if code is self-evident
- "Why" comments → preserve; they carry intent

**Redundancy:**
- Duplicated logic → extract to shared function
- Dead code → remove after confirming (list before deleting)
- Unnecessary abstractions → inline
- `any` types → replace with concrete types

### Step 3: Apply Incrementally

- **One change at a time**, verify tests after each
- Never mix refactoring with behavior changes
- Don't batch multiple improvements into one commit
- **500+ lines changed** → consider codemod / AST transform over manual edits

### Step 4: Verify

After refactoring, confirm all of the following:

- [ ] Existing tests pass **without modification** (if tests needed changes, behavior changed)
- [ ] Build succeeds with no new warnings
- [ ] Linter/formatter passes
- [ ] Diff is clean — no unrelated changes
- [ ] Follows project conventions (import order, Tailwind, functional components)
- [ ] Error handling preserved or strengthened

---

## Rationalizations to Reject

| Rationalization | Reality |
|---|---|
| "It works, don't touch it" | Hard-to-read code is hard to fix when it breaks |
| "Fewer lines = simpler" | A 1-line nested ternary is not simpler than 5 clear lines |
| "This abstraction might be useful later" | Extract on the third use, not the first |
| "Let me fix this too while I'm here" | Separate commit. Refactoring and feature work don't mix |
| "The original author had a reason" | Check git blame — but complexity often just accumulated |

## Red Flags

- Tests need modification after refactoring → behavior changed
- "Simplified" code is longer or harder to follow
- Refactoring code you don't fully understand
- Touching code outside the requested scope
- Removing error handling for "cleanliness"
