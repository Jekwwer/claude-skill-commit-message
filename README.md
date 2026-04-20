# claude-skill-commit-message

Personal Claude Code skill — commit message generation.

Designed for [my `.gitmessage` template][gitmessage]. Rules are specific to that
template's sections. Works best when `~/.gitmessage` matches.

## Install

```bash
claude plugin install https://github.com/Jekwwer/claude-skill-commit-message
```

## What it does

Generates a commit message from staged changes using `~/.gitmessage` as the template.

Strict no-redundancy rules — each fact appears in exactly one section. Empty sections
omitted entirely.

Output only — never runs `git commit`.

## Usage

```text
/commit-message
```

## Uninstall

```bash
claude plugin remove claude-skill-commit-message
```

[gitmessage]: https://github.com/Jekwwer/dotfiles/blob/main/.gitmessage
