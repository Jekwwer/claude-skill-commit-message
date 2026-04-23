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

## Width and wrapping

- **Subject line**: hard cap 72 chars, target ≤50. No trailing period.
- **Body lines**: wrap at 72 chars. Pagers truncate past that in `git log`.
- **Long URLs / paths**: allowed to overflow — do not break them across lines.

## Voice

- Imperative mood: "add", "drop", "fix", "bump" — not "added", "adds", "adding".
- Drop articles: "add hook" not "add a hook"; "fix bug" not "fix the bug".
- Active verbs over phrasal: "swap X for Y" not "replace X with Y"; "bump" not "update
  to latest version".

## Backtick policy

Commit bodies render as markdown in generated `CHANGELOG.md` (semantic-release) and in
GitHub release notes — but render as **literal backticks** in `git log` and GitHub
commit web UI. Balance signal vs noise:

**Use backticks for:**

- File paths: `pyproject.toml`, `.pre-commit-config.yaml`
- File patterns / globs: `*_test.py`, `^(src|tests)/.*\.py$`
- CLI flags: `--pytest`, `--hook-type commit-msg`
- Config keys / values: `default_stages: [pre-commit]`, `target-version = "py312"`
- Shell commands: `make type`, `poetry check --lock`
- Code identifiers when ambiguous: `UP` (ruff rule), `ci.skip`

**Skip backticks for:**

- Package / tool / hook names: ruff, mypy, pyupgrade, conventional-pre-commit
- Section or concept names: "Lint & Format", "Housekeeping"
- Prose nouns already obvious from context

## Info density

Every sentence and bullet must add information. Banned filler (says nothing concrete):

- "to ensure compatibility"
- "latest features and fixes" / "improvements and bug fixes"
- "streamline the X"
- "enhance X" / "improve X" as sole justification
- "to upgrade to the latest version" (self-evident from diff)
- "This commit does X" / "Now X" / "Currently X" (diff says what)
- Date stamps in body — commit metadata already has date

If a sentence survives deleting the filler phrase, keep it. If deletion leaves nothing,
drop the sentence.

## Filling the template

- Fill only sections that apply. Omit sections entirely (including their header) when
  empty.
- Omit placeholder lines — never emit `- <list of files>` or similar.
- Strip all comment lines (lines starting with `#`) from output.

**Header** (always required):

- Breaking change: append `!` to type (e.g. `feat!`)
- Name scope when commit touches 2+ files and a dominant scope exists

**Detailed description** (prose block after header):

- Non-obvious architectural context or multi-paragraph why
- Skip if `[PURPOSE]` already covers the why
- Never restate what `[CHANGES]` or the header already says

**[FILES *]**:

- Drop the section entirely when header+scope already identify the file
  (e.g. `refactor(prettierrc): …` → no `[FILES MODIFIED]` needed)
- Keep bare file list (no em-dash description) when `[CHANGES]` already explains
  per-change context
- Add `- path — role` format only when a file's contribution to the commit can't be
  inferred from `[CHANGES]` or header

**[DEPENDENCIES *]**:

- Only for actual dependency file changes (`package.json`, `pyproject.toml`,
  `poetry.lock`, `package-lock.json`, `.pre-commit-config.yaml` rev bumps)
- `UPDATED` format: `- name: 1.2.3 → 4.5.6`
- Collapse rule: when >5 entries in one ecosystem, list 2–3 architecturally meaningful
  bumps explicitly, then one bullet `- plus X, Y, Z to latest` for the rest
- Separate poetry deps from pre-commit hook revs if both present (semantic distinction)

**[CHANGES]**:

- Only when header is a meta-summary covering 3+ distinct logical changes
- Skip when the header already fully describes a single change
- Record architectural / config decisions only — do NOT restate pure version bumps
  already captured in `[DEPENDENCIES UPDATED]`
- When the change is "swap package X for Y" and both appear in `[DEPENDENCIES REMOVED]`
  + `[DEPENDENCIES ADDED]`, omit from `[CHANGES]` — put swap rationale in `[PURPOSE]`

**[PURPOSE]**:

- Causal, not aspirational. State the triggering condition:
  - Yes: "Hook silently accepted any filename due to missing `--pytest`; convention
    unenforced"
  - Not: "To enforce convention" / "To upgrade and benefit from improvements"
- Skip when the reason is self-evident from the header
- Must not overlap with `[IMPACT]` — PURPOSE = why triggered, IMPACT = what changed for
  users

**[IMPACT]**:

- Observable / actionable effects only:
  - Yes: "Contributors must run `pre-commit install --hook-type commit-msg` before
    first commit"
  - Not: "Improved maintainability" / "Better DX"
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
5. `[CHANGES]` and `[DEPENDENCIES *]` mutually exclusive for pure dep swaps —
   dependency sections carry the swap; `[CHANGES]` carries rationale/config impact if
   any remains.
6. `[FILES *]` role descriptions and `[CHANGES]` bullets mutually exclusive — if a
   file's role is already described in `[CHANGES]`, the file list stays bare.

## Multi-concern commits

If `[CHANGES]` would contain **8+ bullets spanning 2+ unrelated concerns**, flag to the
user that splitting into separate commits may be preferable. Still produce the
single-commit message if the user proceeds — but surface the warning before the code
block.
