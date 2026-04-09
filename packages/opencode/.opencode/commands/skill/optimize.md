---
description: Improve an existing Agent Skill from real feedback
agent: worker
---

## Goal

Improve an existing Agent Skill so it triggers more reliably, stays lean, and produces better outputs for the intended workflow.

## Additional Context

- Favor targeted iteration over full rewrites; keep what already works and change only the parts blocking activation or execution quality
- Prefer optimization grounded in real prompts, evals, reviewer feedback, transcripts, or repeated failures over speculative cleanup

## Workflow

### Arguments

<arguments>
$ARGUMENTS
</arguments>

### Interpret Arguments

- If `<arguments>` contains a skill path, folder, slug, or `SKILL.md` reference, store it as `<skill-ref>`
- If `<arguments>` includes an optimization focus such as triggering, output quality, evals, or excess complexity, store it as `<optimization-focus>`
- If `<arguments>` includes evidence such as prompts, failing cases, reviewer feedback, transcripts, or related files, store it as `<optimization-inputs>`
- If `<arguments>` includes constraints, audience, tools, or notes, store them as `<additional-context>`
- If `<skill-ref>` is still missing, derive it from the conversation
- If the target skill still cannot be determined, STOP and report that a skill reference is required

### Load Skill Context

- Resolve `<skill-ref>` to the target skill directory and store it as `<skill-dir>`
- Confirm `<skill-dir>/SKILL.md` exists; if not, STOP and report that the skill could not be found
- Read the current `SKILL.md`
- Read only the support files that materially affect the optimization focus, such as `references/`, `scripts/`, `assets/`, `evals/`, or nearby docs
- If optimization evidence was provided through `<optimization-inputs>`, load and use it as source context

### Reapply Skill Workflow

- Identify the smallest set of changes that will improve `<optimization-focus>` without rewriting working parts of the skill
- If the skill already matches the requested focus and no meaningful improvement is justified, STOP and report that no changes are needed

### Shared Skill Workflow

#### Load Related Context

- Read only the code, skills, scripts, docs, evals, and conversation context that materially affect this skill
- Ground decisions in project-specific patterns, successful examples, and repeated corrections rather than generic advice
- Use related skills to understand naming, boundaries, and overlap when they are relevant
- If optimizing an existing skill, treat the current skill and its support files as the source of truth before changing anything

#### Design The Skill

- Keep the skill to one coherent reusable job; narrow broad requests to the most reusable unit
- Prefer the smallest correct shape: start with `SKILL.md`, then add support files only when they materially help
- Preserve the existing skill name and directory unless the user explicitly asked for a rename or move
- Store the working skill name as `<skill-name>` and keep `<skill-dir>` as the target directory
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

If the target skill cannot be determined, display:
```
Skill reference required

Provide the skill path, folder, slug, or `SKILL.md` target to optimize.

No additional steps are required.
```

If the target skill cannot be found, display:
```
Skill not found

Target: <skill-ref>

No additional steps are required.
```

If no meaningful optimization is needed, display:
```
No skill changes needed

Skill: <skill-dir>
Reason: <no-change-reason>

No additional steps are required.
```

When the skill is optimized, display:
```
Optimized skill: <skill-dir>

Updated files:
<file-lines>

Validation:
<validation-results>

No additional steps are required.
```
