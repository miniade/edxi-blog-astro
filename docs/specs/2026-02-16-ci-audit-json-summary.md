# Task: CI migration audit machine-readable summary

## Goal
Make migration audit results easier to consume in CI by emitting a JSON summary and rendering a GitHub Actions job summary, while keeping the existing markdown report and fail-fast behavior.

## Scope
- In scope:
  - Extend `scripts/audit-migration-parity.mjs` to emit `docs/MIGRATION_AUDIT.json`
  - Add audit JSON upload in deploy workflow
  - Add CI step to append concise parity summary to GitHub Actions Step Summary
- Out of scope:
  - Changing migration parity matching rules
  - Changing deploy target repository/branch

## Plan
1. Add JSON report generation alongside markdown report.
2. Add workflow artifact upload for JSON report.
3. Add a workflow step that reads JSON and writes a compact summary to `$GITHUB_STEP_SUMMARY`.
4. Run local validation (`npm run audit:migration`, `npm run build`).

## Risks
- CI summary step may fail if JSON schema is unstable.
- Additional report output could drift if markdown/json payloads are built independently.

## Validation
- [x] Build passes (`npm run build`)
- [x] Key routes/features verified (build output includes all 20 migrated blog routes)
- [ ] Deployment workflow passes

## Change Log
- 2026-02-16T17:46:00Z Spec created for audit JSON + CI summary enhancement.
- 2026-02-16T17:46:03Z Implemented JSON audit output and CI step summary/artifact upload changes.
- 2026-02-16T17:46:03Z Local validation passed: `npm run audit:migration` (legacy=20, astro=20, missing=0, extra=0) + `npm run build`.

## Decisions
- Decision: Keep markdown report as source-facing artifact and add JSON as machine-facing artifact.
- Rationale: Preserves existing human workflow while enabling robust CI summarization and future automation.
