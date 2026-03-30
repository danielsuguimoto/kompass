---
description: Ship branch work through commit and PR creation
agent: navigator
---

## Goal

Ship the current work by dispatching branch creation, commit creation, and PR creation in the current session.

## Additional Context

Use `<branch-context>` to steer dispatched branch naming. Use `<additional-context>` to refine the dispatched commit and PR summaries. Pass `<base>` through to PR creation when it was provided. This command is session-command-first: send each `<kompass_session_command>` body literally through `kompass_session_command` and use the result as the source of truth for the next step.

## Workflow

### Arguments

<arguments>
$ARGUMENTS
</arguments>

### Interpret Arguments

- Initialize `<base>`, `<branch-context>`, and `<additional-context>` as empty
- If `<arguments>` is empty, proceed with defaults
- If the trimmed `<arguments>` is only a branch reference (for example `main` or `origin/develop`), store it as `<base>` and leave the context fields empty
- Otherwise, store `<arguments>` as both `<branch-context>` and `<additional-context>`

### Ensure Feature Branch

<kompass_session_command agent="worker">
/branch
Branch naming guidance: <branch-context>
</kompass_session_command>

- Store the dispatch result as `<branch-result>`
- If `<branch-result>` is blocked or incomplete, STOP and report the branch blocker
- If `<branch-result>` says there was nothing to branch from, continue without changing branches
- Otherwise, continue with the created branch

### Delegate Commit

<kompass_session_command agent="worker">
/commit
Additional context: <additional-context>
</kompass_session_command>

- Store the dispatch result as `<commit-result>`

- If `<commit-result>` says there was nothing to commit, continue without creating a new commit
- If `<commit-result>` is blocked or incomplete, STOP and report the commit blocker
- Otherwise, continue with the created commit

### Delegate PR Creation

<kompass_session_command agent="worker">
/pr/create
Base branch: <base>
Additional context: <additional-context>
</kompass_session_command>

- Store the dispatch result as `<pr-result>`

- If `<pr-result>` is blocked or incomplete, STOP and report the PR blocker
- If `<pr-result>` says there is nothing to include in a PR, STOP and report that there is nothing to ship
- Otherwise, continue with the created or existing PR

### Output

If there is nothing to ship, display:
```
Nothing to ship

No additional steps are required.
```

When complete, display:
```
Ship flow complete

Branch: <branch-result>
Commit: <commit-result>
PR: <pr-result>

No additional steps are required.
```
