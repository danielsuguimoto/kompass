---
description: Create a focused Agent Skill from repo context
agent: worker
---

## Goal

Create a new Agent Skill from project context and user direction, producing a focused `SKILL.md` and only the supporting files that materially improve the skill.

## Additional Context

- Favor creation over revision: create the smallest correct first version of the skill from the gathered context
- Only add support files during creation when they clearly improve execution on day one

## Workflow

### Arguments

<arguments>
$ARGUMENTS
</arguments>

### Interpret Arguments

- If `<arguments>` contains a clear skill request, store it as `<skill-request>`
- If `<arguments>` contains an explicit skill name, slug, or desired folder name, store it as `<requested-name>`
- If `<arguments>` includes supporting context such as file paths, URLs, ticket references, or existing examples, store them as `<context-sources>`
- If `<arguments>` includes constraints, audience, tools, or notes, store them as `<additional-context>`
- If `<skill-request>` is still missing, derive it from the conversation
- If the request still cannot be determined, STOP and report that skill direction is required

### Load Starting Context

- Inspect the repository for existing skills, skill roots, and nearby conventions before creating anything
- If the repo already uses one clear skill root, store it as `<skill-root>`
- Otherwise, store `.agents/skills` as `<skill-root>`
- Read only the relevant existing skills, docs, scripts, and project artifacts needed to ground the new skill
- If an existing skill already covers the same scope and the request does not clearly justify a separate skill, STOP and report the overlap instead of creating a duplicate

### Shared Skill Workflow

#### Load Related Context

- Read only the code, skills, scripts, docs, evals, and conversation context that materially affect this skill
- Ground decisions in project-specific patterns, successful examples, and repeated corrections rather than generic advice
- Use related skills to understand naming, boundaries, and overlap when they are relevant
- If optimizing an existing skill, treat the current skill and its support files as the source of truth before changing anything

#### Design The Skill

- Keep the skill to one coherent reusable job; narrow broad requests to the most reusable unit
- Prefer the smallest correct shape: start with `SKILL.md`, then add support files only when they materially help
- Derive `<skill-name>` by preferring `<requested-name>` when it is valid; otherwise create a lowercase hyphenated name that matches the intended folder name and satisfies the Agent Skills naming rules
- Store the target directory as `<skill-dir>` = `<skill-root>/<skill-name>`
- Write the `description` as an imperative trigger instruction focused on user intent, such as `Use this skill when...`
- Prefer one clear default approach; mention alternatives only as explicit escape hatches
- Include gotchas, validation loops, examples, or output templates only when they materially improve execution
- Keep `SKILL.md` concise; move heavy detail to `references/`, `scripts/`, `assets/`, or `evals/` with explicit load conditions

#### Write The Skill

- Create or update `<skill-dir>/SKILL.md`
- Keep frontmatter minimal: use `name` and `description`, and add optional fields only when they are justified
- Write concrete procedures and defaults instead of generic declarations
- Avoid empty directories, placeholder files, and speculative assets
- Store the changed file list as `<file-lines>` with one bullet per file path

#### Validate The Skill

- Confirm the directory name matches the skill name in frontmatter
- Confirm the frontmatter is valid and the description remains within the Agent Skills limits
- Confirm file references are relative to the skill root and point to real files
- If scripts or eval helpers were added or updated, run the most relevant available validation for those files
- Store the resulting validation summary as `<validation-results>`

### Output

If skill direction is missing, display:
```
Skill direction required

Provide the skill goal, workflow, or domain so the skill can be created.

No additional steps are required.
```

If an existing skill already covers the scope, display:
```
Skill already exists for this scope

Existing skill: <existing-skill-path>
Reason: <overlap-reason>

No additional steps are required.
```

When the skill is created, display:
```
Created skill: <skill-name>

Path: <skill-dir>/SKILL.md
Files:
<file-lines>

Validation:
<validation-results>

No additional steps are required.
```
