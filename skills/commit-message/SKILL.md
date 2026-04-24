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

Default: produce a fenced code block containing the commit message. Nothing else — no
preamble, no explanation.

Exception: when the multi-concern rule (see bottom) triggers, surface the split offer in
prose first and await user response. Proceed to the code block only after the user
decides.

## Width and wrapping

- Subject line: hard cap 72 chars, target ≤60. No trailing period.
- Body lines: wrap at 72 chars. Pagers truncate past that in `git log`.
- Long URLs / paths: allowed to overflow — do not break them across lines.

## Voice

- Imperative mood: "add", "drop", "fix", "bump" — not "added", "adds", "adding".
- Drop articles in header and bullets only: "add hook" not "add a hook"; "fix bug" not
  "fix the bug". Prose sections (`[PURPOSE]`, `[IMPACT]`, detailed description) keep
  articles — causal prose reads better with them.
- Active verbs over phrasal: "swap X for Y" not "replace X with Y"; "bump" not "update
  to latest version".

## Banned weak verbs

These verbs rarely carry information; they wrap a filler phrase. Name the actual action
or effect instead.

- ensure, make sure → state the effect directly ("exit code propagates")
- utilize, leverage → use, or name the concrete action
- facilitate, enable, allow — unless naming a real capability exposed
- provide — unless naming the concrete artifact provided
- handle, manage — unless naming the specific handling

## Markdown policy

Commit bodies render as plain text in `git log`, VS Code timeline, and default GitHub
commit views. Only pull-request bodies render markdown. Default output: plain text, no
backticks, no bold, no italics.

Use backticks only when a token would be ambiguous or unreadable without them:

- Quoted string literals with spaces: `"usage: cli ..."`, `"module-not-measured"`
- Regex or glob patterns: `^(src|tests)/.*\.py$`, `*_test.py`
- Values containing punctuation that fights prose parsing

Do not backtick: file paths, module names, CLI flags, config keys, shell commands, tool
names, package names, function names. These read fine bare — pyproject.toml is obviously
a filename; --pytest is obviously a flag; make type is obviously a command.

## Structure and whitespace

Visual separation carries at least as much signal as section headers.

- Blank line before each `[SECTION]` header and after its last line.
- Single-line bullets stack tight.
- If any bullet in a section wraps past one line, blank-line-separate every bullet in
  that section (consistency beats mixed density).
- One fact per bullet. Parentheticals inside a bullet: ≤6 words. Anything longer belongs
  in `[PURPOSE]` or gets dropped.
- Prose blocks (`[PURPOSE]`, `[IMPACT]`, detailed description): max 2 sentences. Past 2
  → convert to bullets.

## Info density

Every sentence and bullet must add concrete information. Decision procedure: delete the
phrase. If the sentence still carries the fact, the phrase was filler — keep it deleted.
If nothing survives, the whole sentence was filler — drop it entirely.

Specific banned phrases (examples of the rule above, not exhaustive):

- "to ensure compatibility"
- "latest features and fixes" / "improvements and bug fixes"
- "streamline the X"
- "enhance X" / "improve X" as sole justification
- "to upgrade to the latest version" (self-evident from diff)
- "This commit does X" / "Now X" / "Currently X" (diff says what)
- "in order to" → "to"
- "as needed" / "as appropriate" / "where applicable"
- "for consistency" — name what's being made consistent with what
- "cleaner" / "nicer" / "better" as sole justification
- "going forward" / "from now on"
- "out of the box"
- Date stamps in body — commit metadata already has date

## Density targets (soft)

Match body size to decision surface, not diff size.

- Trivial single-file mechanical change: header plus 0-2 bullets.
- Multi-file or architectural change: `[CHANGES]` plus `[PURPOSE]` when the why is
  non-obvious.
- `[IMPACT]` only when users must act or behavior visibly changed.
- `[CHANGES]` bullets: 3-8 typical. Past 8 → commit probably too big (see multi-concern
  rule).

## Filling the template

Body section order:

1. Detailed description (rare — see rule below)
2. `[CHANGES]`
3. `[PURPOSE]`
4. `[IMPACT]`
5. `[FILES ADDED]` / `[FILES REMOVED]`
6. `[DEPENDENCIES ADDED]` / `[DEPENDENCIES UPDATED]` / `[DEPENDENCIES REMOVED]`
7. `[REFERENCES]`
8. Footers (`Closes`, `Refs`, `BREAKING CHANGE`)

Fill only sections that apply. Omit empty sections entirely (header included). Never
emit placeholder lines like `- <list of files>`. Strip all comment lines (lines starting
with `#`) from output.

### Header (always required)

- Format: `type(scope): description`.
- Scope is optional. Use it when commit touches 2+ files and a dominant scope exists.
- Breaking change: `!` goes before the colon, after the closing paren if scope is
  present. With scope: `type(scope)!: description`. Without scope: `type!: description`.
- Subject target ≤60 chars, hard cap 72. No trailing period.

### Detailed description (prose block after header)

- Use only for breaking-change migration narrative or cross-cutting context that
  structured sections cannot carry.
- Default: omit. Prefer `[PURPOSE]` for the why.
- Respects the 2-sentence prose cap; past that, restructure.

### `[CHANGES]`

- Include when the commit covers 3+ logically distinct changes. Logical ≠ mechanical:
  renaming 5 files is one logical change; dropping a dep, adding a replacement, and
  rewiring config is three.
- Skip when the header fully describes a single change.
- Record architectural or config decisions only. Do not restate pure version bumps
  already captured in `[DEPENDENCIES UPDATED]`.
- When the change is "swap package X for Y" and both appear in
  `[DEPENDENCIES REMOVED]` + `[DEPENDENCIES ADDED]`, omit from `[CHANGES]` — put swap
  rationale in `[PURPOSE]`.

### `[PURPOSE]`

- State the triggering cause, not the aspiration:
  - Yes: "hook silently accepted any filename due to missing --pytest; convention
    unenforced"
  - Not: "to enforce convention" / "to benefit from improvements"
- Skip when the reason is self-evident from the header.
- Must not overlap with `[IMPACT]` — PURPOSE = why triggered, IMPACT = what changed for
  users.

### `[IMPACT]`

- Observable or actionable effects only:
  - Yes: "contributors must run pre-commit install --hook-type commit-msg before first
    commit"
  - Not: "improved maintainability" / "better DX"
- Skip for internal refactors with no visible behavioral change.
- Must not restate `[PURPOSE]`.

### `[FILES ADDED]` / `[FILES REMOVED]`

- Include deliberate additions and deletions so intent is visible without running git
  show.
- `[FILES MODIFIED]` is not used — `git show --stat` already reports modified files and
  the section duplicates that signal.
- Bare file list preferred. Add `- path — role` only when a file's contribution cannot
  be inferred from `[CHANGES]` or header.

### `[DEPENDENCIES ADDED]` / `[DEPENDENCIES UPDATED]` / `[DEPENDENCIES REMOVED]`

- Only for actual dependency file changes: `package.json`, `pyproject.toml`,
  `poetry.lock`, `package-lock.json`, `.pre-commit-config.yaml` rev bumps.
- Formats:
  - ADDED: `- name: version` (e.g. `- ruff-pre-commit: v0.15.11`)
  - UPDATED: `- name: old → new` (e.g. `- ruff: ^0.11.12 → ^0.15.11`)
  - REMOVED: `- name: last-known-version` (e.g. `- pyupgrade: ^3.15`)
- Collapse rule: when more than 5 entries in one ecosystem, list 2-3 architecturally
  meaningful bumps individually, then one bullet `- plus X, Y, Z to latest` for the
  rest.
- Separate poetry deps from pre-commit hook revs in different sections if both present
  (semantic distinction).

### `[REFERENCES]`

- Links to related docs, designs, reviews, external issues.
- Skip when nothing applies.

### Footers (last block — nothing after)

- `Closes #n` — one per line. Only when the commit actually closes the issue.
- `Refs #n` — one per line. For related issues mentioned but not closed.
- `BREAKING CHANGE: description` — only for actual breaking changes. Must pair with `!`
  in header. Must be the final footer; anything after becomes part of the note.

## Strict no-redundancy rules

1. Each fact lives in exactly one section. A bullet in `[CHANGES]` does not also appear
   in prose or `[PURPOSE]`.
2. Header and `[CHANGES]` are mutually exclusive for the same info. Header fully
   describes change → omit `[CHANGES]`.
3. `[PURPOSE]` and `[IMPACT]` must not mirror each other. Use both only when cause and
   effect are genuinely distinct and both non-obvious.
4. Detailed description and `[PURPOSE]` are mutually exclusive for the why. Use prose or
   structured section, not both.
5. `[CHANGES]` and `[DEPENDENCIES *]` are mutually exclusive for pure dep swaps —
   dependency sections carry the swap; `[CHANGES]` carries rationale or config impact
   only if any remains.
6. `[FILES *]` role descriptions and `[CHANGES]` bullets are mutually exclusive — if a
   file's role is already in `[CHANGES]`, the file list stays bare.

## Multi-concern commits

If `[CHANGES]` would contain 5+ bullets spanning 2+ distinct scopes, the commit is a
split candidate. Before generating, surface this to the user with a concrete offer:

> 5 bullets cross 2 scopes (pyproject, ci). Want me to write separate messages for each
> scope?

Proceed with the single-commit form only if the user declines the split.
