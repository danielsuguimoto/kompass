## Goal

Create a new Agent Skill from project context and user direction, producing a focused `SKILL.md` and only the supporting files that materially improve the skill.

## Additional Context

- Favor creation over revision: create the smallest correct first version of the skill from the gathered context
- Only add support files during creation when they clearly improve execution on day one
<%~ include("@additional-context-priority") %>

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

<%~ include("@skill-authoring", { mode: "create" }) %>

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
