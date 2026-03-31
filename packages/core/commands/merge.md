## Goal

Merge a provided branch into the current branch, defaulting to the repo base branch, and resolve merge conflicts with a best-effort preference for the incoming branch.

## Additional Context

Consider `<additional-context>` when choosing between competing conflict resolutions.
- Default to preserving both sides when the intent is clear and the merged result remains coherent.
- When a confident manual merge is not obvious, prefer the incoming `<merge-source>` version to keep the command moving.
- Do not create a merge commit if any conflicts remain unresolved.

## Workflow

### Arguments

<arguments>
$ARGUMENTS
</arguments>

### Interpret Arguments

- If `<arguments>` starts with or contains a clear branch or ref name, store it as `<merge-source>`
- If `<arguments>` includes additional merge guidance, store it as `<additional-context>`
- If no branch or ref was provided, leave `<merge-source>` undefined for now

### Resolve Merge Source

- If `<merge-source>` is already defined, keep it
- Otherwise, resolve the repo base branch and store it as `<merge-source>`
- Store the current checked out branch as `<current-branch>`

### Check Blockers

- If the working tree has uncommitted or untracked changes, STOP and report that merge automation requires a clean working tree
- If `<merge-source>` cannot be resolved to an existing local or remote ref, STOP and report that the merge source could not be found
- If `<current-branch>` equals `<merge-source>`, STOP and report that the current branch is already the merge source

### Run Merge

- Start the merge with `git merge <merge-source>`
- If git reports a clean merge with no conflicts, store the new merge commit hash as `<merge-commit>`
- If git reports conflicts, continue to `Resolve Conflicts`

### Resolve Conflicts

- Treat `git status` and the conflicted file markers as the source of truth for unresolved files
- For each conflicted file, attempt a best-effort merge that preserves the intended behavior of both sides
- Use `<additional-context>` when it helps disambiguate intent
- If a conflict can be resolved confidently by combining both sides, do that and stage that file with `git add <file>`
- If a confident manual merge is not obvious, prefer the incoming `<merge-source>` side for that conflict, then stage that file with `git add <file>`
- Do not wait until the end to stage everything implicitly; each resolved conflicted file must be explicitly staged before continuing
- After resolving all conflicts, finish the merge non-interactively with `GIT_EDITOR=true git merge --continue` and store the new merge commit hash as `<merge-commit>`
- If any conflicts remain unresolved, STOP and report the remaining files without continuing the merge

### Output

If merge automation is blocked by a dirty working tree, display:
```
Merge blocked: working tree is not clean

Commit, stash, or discard local changes before running `/merge`.

No additional steps are required.
```

If the merge source cannot be found, display:
```
Merge blocked: source branch not found

Source: <merge-source>

No additional steps are required.
```

If the current branch already matches the merge source, display:
```
Merge skipped: already on <current-branch>

No additional steps are required.
```

If any conflicts remain unresolved, display:
```
Merge blocked: unresolved conflicts remain

Source: <merge-source>
Branch: <current-branch>

Resolve the remaining conflicted files, then retry.

No additional steps are required.
```

When the merge succeeds, display:
```
Merged <merge-source> into <current-branch>

Commit: <merge-commit>

No additional steps are required.
```
