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
3. Review diff and run validation commands
4. Update spec `Change Log` + `Decisions`
5. Commit code + docs together

## Minimum Validation for this repo

- `npm run build`
- if deployment-related: verify GitHub Action run success
- verify publish repo received deploy commit
