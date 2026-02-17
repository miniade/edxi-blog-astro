# Development Workflow (Codex-first)

This project follows a **Codex-first** workflow for all code-related work.

## Rules

1. **All coding tasks must be executed via developer tools first**
   - Preferred: `codex` CLI
   - Alternatives: `opencode`, `gemini cli` (when explicitly needed)
2. **Every coding change must have written context/spec documentation** before or with implementation.
3. **No silent refactors**: decisions, scope, and validation steps must be recorded.

## Spec/Context Documentation Standard

For each task, create a spec file at:

- `docs/specs/YYYY-MM-DD-<task-slug>.md`

Template:

```md
# Task: <title>

## Goal
<what we are changing and why>

## Scope
- In scope:
- Out of scope:

## Plan
1. ...
2. ...

## Risks
- ...

## Validation
- [ ] Build passes
- [ ] Key routes/features verified
- [ ] Deployment workflow passes

## Change Log
- <timestamp> <what changed>

## Decisions
- Decision:
- Rationale:
```

## Execution Pattern

1. Create/update spec doc
2. Execute implementation with Codex CLI
3. If Codex execution fails, auto-retry once with a narrowed prompt
4. If retry also fails, switch to fallback command/tool path and continue
5. Review diff and run validation commands
6. Update spec `Change Log` + `Decisions`
7. Commit code + docs together

## Codex Reliability Policy (Auto-Retry + Fallback)

For coding tasks, use this reliability chain:

1. **Primary**: `codex exec` with `pty=true`
2. **Retry once**: rerun with a narrowed/safer prompt (same task, smaller scope)
3. **Fallback**:
   - command fallback: prefer POSIX-safe alternatives (`grep` when `rg` missing, `python3` when `python` missing)
   - tool fallback: if Codex run is blocked by sandbox constraints, apply equivalent minimal patch directly in workspace and continue validation

Required logging in spec Change Log:
- whether retry happened
- which fallback was used
- why fallback was required

## Minimum Validation for this repo

- `npm run build`
- if deployment-related: verify GitHub Action run success
- verify publish repo received deploy commit
