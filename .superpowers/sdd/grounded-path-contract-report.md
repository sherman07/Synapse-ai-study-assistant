# Grounded path contract follow-up

## Status

Implemented the focused `path_update` contract fix. The normalizer now retains the UI-required top-level fields `title`, `summary`, `total_hours`, `next_session`, `status`, `current_level_id`, `next_level_id`, and `completed_level_ids`, plus the bounded level fields `id`, `title`, `objective`, `status`, `graduation`, `hours`, and `subskills`.

All fields remain explicitly allowlisted. Text is bounded, `total_hours` is capped at 80 characters, and list values remain capped at eight entries. Unknown top-level fields, unknown nested level fields, nested objects, oversized text, and excess levels/subskills are discarded or bounded.

## Verification

Command:

```text
/Users/zhenghui/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 -m unittest backend.tests.test_learning_companion_contract backend.tests.test_learning_companion
```

Result: 17 tests passed, exit code 0.

The test run emitted the existing Starlette/httpx deprecation warning from the installed FastAPI test client dependency; it did not affect the result.

## Concerns

No functional concerns identified. Three unrelated pre-existing worktree modifications were left untouched.
