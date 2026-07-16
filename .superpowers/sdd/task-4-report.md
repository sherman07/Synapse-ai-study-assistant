# Task 4 Report: Restyle Companion as a focused conversation surface

Date: July 16, 2026

## Scope

Implemented the requested Task 4 styling change in the allowed frontend files:

- `frontend/styles/01-section.css`
- `frontend/tests/ai-learning-companion-shell-regression.mjs`

Also wrote this report file as requested. Preserved unrelated workspace changes, including untracked `pnpm-lock.yaml` and `pnpm-workspace.yaml`.

## TDD flow

### 1. Red: added failing regression checks first

Updated `frontend/tests/ai-learning-companion-shell-regression.mjs` to assert:

- `.companion-chat-thread`
- `.companion-composer`
- `.companion-turn-failure`
- absence of `.companion-start-form`

### 2. Red verification

The brief suggested:

```bash
node frontend/tests/ai-learning-companion-shell-regression.mjs
```

This environment did not expose `node` on `PATH`, so I used the bundled runtime binary directly:

```bash
/Users/zhenghui/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node frontend/tests/ai-learning-companion-shell-regression.mjs
```

Observed expected failure:

- assertion failed for missing `.companion-chat-thread`

That confirmed the new regression was genuinely red before CSS changes.

### 3. Green: replaced the legacy Companion-only styling

In `frontend/styles/01-section.css` I replaced the old form/journey/session-only Companion rules with scoped chat-surface styling:

- added `companion-chat` as a full-height flex conversation card
- styled `companion-chat-header` / `companion-session-meta` as a focused top bar with compact action placement
- styled `companion-chat-thread` / `companion-messages` as a readable scrollable conversation thread
- styled assistant and learner bubbles with distinct alignment, radius, and surface treatment
- styled `companion-turn-failure` as an inline retry/error panel
- styled `companion-composer` / `companion-compose` as a sticky bottom composer with focus-visible treatment
- added responsive rules below `720px` so the header stacks, bubbles use full width, and the composer stays usable

Removed the legacy selectors dedicated to the old Companion flow, including:

- `.companion-start-form`
- `.companion-subject-picker`
- `.companion-journey*`
- old session form/select styling
- `.companion-message-next`

Kept the existing materials-mode selectors intact.

### 4. Green verification

Focused regression after the CSS update:

```bash
/Users/zhenghui/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node frontend/tests/ai-learning-companion-shell-regression.mjs
```

Result:

- `ai learning companion shell regression passed`

## Full verification

Because `npm` was not available on `PATH`, I ran the equivalent underlying commands directly with the bundled runtime:

### Frontend regressions

```bash
for test_file in frontend/tests/*.mjs; do /Users/zhenghui/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node "$test_file" || exit 1; done
```

Result:

- all frontend regression files passed

### Production builds

```bash
/Users/zhenghui/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js build
/Users/zhenghui/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js build --config vite.focus-room-static.config.js
/Users/zhenghui/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/copy_frontend_runtime_assets.mjs
```

Results:

- both Vite builds completed successfully
- frontend runtime assets copied
- existing warnings remained non-blocking:
  - non-module script bundling warnings from legacy HTML entrypoints
  - large chunk size warnings

## Commit

Staged only:

- `frontend/styles/01-section.css`
- `frontend/tests/ai-learning-companion-shell-regression.mjs`
- `.superpowers/sdd/task-4-report.md`

Requested commit message:

```bash
style: make companion a chat surface
```
