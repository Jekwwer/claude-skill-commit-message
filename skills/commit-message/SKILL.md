---
name: commit-message
description: >
  Generate a commit message following ~/.gitmessage template. Strict no-redundancy
  rules: each fact appears in exactly one section. Output only — never runs git commit.
  Use when user says "write commit message", "generate commit", "/commit-message".
disable-model-invocation: true
argument-hint: '[optional: description of what was changed]'
---

Generate a commit message following this template (loaded from `~/.gitmessage`):

!`cat ~/.gitmessage`

---

Run `git diff --staged` (and `git status` if needed) to understand the changes.

## Output format

Produce a fenced code block containing the commit message. Nothing else — no preamble,
no explanation.

## Filling the template

- Fill only sections that apply. Omit sections entirely (including their header) when
  empty.
- Omit placeholder lines — never emit `- <list of files>` or similar.
- Strip all comment lines (lines starting with `#`) from output.

**Header** (always required):

- Imperative mood: "add" not "adds"/"added"
- Breaking change: append `!` to type

**Detailed description** (prose block after header):

- Non-obvious architectural context or multi-paragraph why
- Skip if `[PURPOSE]` already covers the why
- Never restate what `[CHANGES]` or the header already says

**[FILES *]**:

- Only list a file when its role is non-obvious from the diff
- Format: `- filename — one-line role description`
- Skip obvious entries (e.g. `fix(auth): fix login` → no need to list `auth.py`)

**[DEPENDENCIES *]**:

- Only for actual dependency file changes (package.json, pyproject.toml, lockfiles)
- `UPDATED` format: `- name: 1.2.3 → 4.5.6`

**[CHANGES]**:

- Only when header is a meta-summary covering 3+ distinct logical changes
- Skip when the header already fully describes a single change

**[PURPOSE]**:

- The triggering reason: bug, requirement, compliance need, performance target
- Skip when reason is self-evident from the header
- Must not overlap with `[IMPACT]` — PURPOSE = why triggered, IMPACT = what changed for
  users

**[IMPACT]**:

- User-facing or API-visible effects only
- Skip for internal refactors with no visible behavioral change
- Must not restate `[PURPOSE]`

**Footers**:

- `Closes #n` — only when actually closing an issue
- `BREAKING CHANGE:` — only for actual breaking changes; must follow `!` in header

## Strict no-redundancy rules

1. Each fact lives in exactly one section. Point in `[CHANGES]` → not in description or
   `[PURPOSE]`.
2. Header + `[CHANGES]` mutually exclusive for the same info. Header fully describes
   change → omit `[CHANGES]`.
3. `[PURPOSE]` and `[IMPACT]` must not mirror each other. Use both only when cause and
   effect are genuinely distinct and both non-obvious.
4. Detailed description and `[PURPOSE]` mutually exclusive for the why. Use prose or
   structured list, not both.
