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

<%~ include("@skill-authoring", { mode: "optimize" }) %>

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
