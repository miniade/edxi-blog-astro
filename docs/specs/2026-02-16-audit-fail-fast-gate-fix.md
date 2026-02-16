# Task: Make migration audit fail-fast for CI gate

## Goal
Ensure `npm run audit:migration` exits non-zero when migration parity drifts, so the CI gate actually blocks problematic deploys.

## Scope
- In scope:
  - Update `scripts/audit-migration-parity.mjs` to print concise audit summary.
  - Return non-zero exit code when missing/extra slugs are detected.
  - Return non-zero exit code on audit runtime errors.
  - Keep report generation (`docs/MIGRATION_AUDIT.md`) intact.
- Out of scope:
  - Reworking slug matching rules.
  - Changing content model/frontmatter schema.

## Plan
1. Inspect existing audit script behavior and gap with CI gate expectations.
2. Implement fail-fast exit behavior and human-readable console output.
3. Run `npm run audit:migration` and `npm run build` to validate no regressions.
4. Update this spec with change log and decisions.

## Risks
- False positives if slug extraction logic is incomplete.
- CI behavior change could block deploys if future content intentionally diverges.

## Validation
- [x] Build passes (`npm run build`)
- [x] Key routes/features verified (`npm run audit:migration` summary reports `missing=0, extra=0`)
- [ ] Deployment workflow passes

## Change Log
- 2026-02-16T13:16:00Z Created spec for audit fail-fast gate fix.
- 2026-02-16T13:18:00Z Updated `scripts/audit-migration-parity.mjs` to print audit summary and fail with exit code 1 when parity diffs exist.
- 2026-02-16T13:19:00Z Added error-path stderr logging and non-zero exit code on runtime failure while preserving fallback report write.
- 2026-02-16T13:20:00Z Validation passed locally: `npm run audit:migration`, `npm run build`.

## Decisions
- Decision: Keep parity comparison logic unchanged and only harden process exit semantics/output.
- Rationale: Minimal, low-risk fix that makes existing CI gate effective immediately.
- Decision: Keep report generation even on failures.
- Rationale: `docs/MIGRATION_AUDIT.md` remains the debugging artifact for CI and manual inspection.
