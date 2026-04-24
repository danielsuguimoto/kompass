#### Step 1: Load Changes
- call `changes_load`
<%= it.rules ?? "" %>
- Store the returned result as `<changes>`
- Use `<changes>` as the source of truth; no additional git analysis commands are needed
- When `<changes>.comparison` is not `uncommitted`, treat `<changes>.commits` as the authoritative scope of work: only summarize commits that are ahead of the resolved base branch
- Do not infer scope from the branch names alone and do not describe work that exists only on the base branch

#### Step 2: Analyze Files
- Review the paths, statuses, and diffs from `<changes>` only as file-level context for the commits in scope
- Identify the nature of changes (added, modified, deleted)
- Note lines added/removed per file

#### Step 3: Group and Summarize
- For branch comparisons, build the summary from `<changes>.commits` first and use file diffs only to verify or refine what those commits changed
- Group related changes into logical themes
- Summarize the "what" and "why" (not the "how")
