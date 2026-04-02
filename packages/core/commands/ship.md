## Goal

Ship the current work by dispatching branch creation, commit creation, and PR creation in the current session.

## Additional Context

Use `<branch-context>` to steer delegated branch naming. Use `<additional-context>` to refine the delegated commit and PR summaries. Pass `<base>` through to PR creation when it was provided.

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

### Delegate Branch Creation

<delegate agent="worker" command="branch">
Branch naming guidance: <branch-context>
</delegate>

- Store the delegated result as `<branch-result>`
- If `<branch-result>` says there was nothing to branch from, continue on the current branch
- If `<branch-result>` says branching was skipped because the current branch already looks like a work branch, continue on the current branch
- If `<branch-result>` is blocked or incomplete, STOP and report the branch blocker
- Otherwise, continue with the created branch

### Delegate Commit

<delegate agent="worker" command="commit">
Additional context: <additional-context>
</delegate>

- Store the delegated result as `<commit-result>`
- If `<commit-result>` says there was nothing to commit, continue without creating a new commit
- If `<commit-result>` is blocked or incomplete, STOP and report the commit blocker
- Otherwise, continue with the created commit

### Delegate PR Creation

<delegate agent="worker" command="pr/create">
Base branch: <base>
Additional context: <additional-context>
</delegate>

- Store the delegated result as `<pr-result>`
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
