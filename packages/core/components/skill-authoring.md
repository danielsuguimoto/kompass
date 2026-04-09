### Shared Skill Workflow

#### Load Related Context

- Read only the code, skills, scripts, docs, evals, and conversation context that materially affect this skill
- Ground decisions in project-specific patterns, successful examples, and repeated corrections rather than generic advice
- Use related skills to understand naming, boundaries, and overlap when they are relevant
- If optimizing an existing skill, treat the current skill and its support files as the source of truth before changing anything

#### Design The Skill

- Keep the skill to one coherent reusable job; narrow broad requests to the most reusable unit
- Prefer the smallest correct shape: start with `SKILL.md`, then add support files only when they materially help
<% if (it.mode === "create") { -%>
- Derive `<skill-name>` by preferring `<requested-name>` when it is valid; otherwise create a lowercase hyphenated name that matches the intended folder name and satisfies the Agent Skills naming rules
- Store the target directory as `<skill-dir>` = `<skill-root>/<skill-name>`
<% } else { -%>
- Preserve the existing skill name and directory unless the user explicitly asked for a rename or move
- Store the working skill name as `<skill-name>` and keep `<skill-dir>` as the target directory
<% } -%>
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
- If `skills-ref` is available, run `skills-ref validate <skill-dir>`
- Otherwise, perform manual validation of the structure, frontmatter, trigger description, and referenced files
- If scripts or eval helpers were added or updated, run the most relevant available validation for those files
- Store the resulting validation summary as `<validation-results>`
