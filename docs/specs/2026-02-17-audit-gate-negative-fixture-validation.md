# Task: migration audit gate negative fixture validation

## Goal
Close the remaining verification gap by adding an automated negative-fixture check proving `audit:migration` fails when a `pubDate` and `legacyPath` date mismatch is introduced.

## Scope
- In scope:
  - Add configurable Astro content root input to migration audit script for isolated fixture runs.
  - Add a verification script that creates a temporary mutated fixture and asserts `audit:migration` exits non-zero.
  - Add npm script entry for this verification flow.
  - Re-run required validations and record CI/deploy evidence.
- Out of scope:
  - Changing migration parity matching rules.
  - Bulk content rewrites.

## Plan
1. Add `ASTRO_BLOG_ROOT` override support in `scripts/audit-migration-parity.mjs`.
2. Add `scripts/verify-migration-audit-gate.mjs`:
   - copy blog content to temp dir,
   - mutate one migrated post `pubDate` to force mismatch,
   - run audit against temp root,
   - assert non-zero exit and mismatch signal in generated JSON report.
3. Add `npm run audit:migration:verify-gate` script.
4. Run `npm run audit:migration && npm run build`.
5. Run `npm run audit:migration:verify-gate` and capture result.
6. Check CI/deploy workflow status and note evidence.

## Risks
- Temporary fixture mutation could be brittle if selected file format changes.
- New override env var might be misused if not documented clearly.

## Validation
- [x] `npm run audit:migration` passes.
- [x] `npm run build` passes.
- [x] `npm run audit:migration:verify-gate` passes (i.e. confirms failure is detected).
- [x] CI deploy workflow still includes migration audit gate before build/deploy.
- [x] Publish repo latest deploy commit maps to latest successful source CI run.

## Change Log
- 2026-02-17T05:47:00Z Created spec for negative-fixture validation of migration audit gate.
- 2026-02-17T05:44:00Z Codex CLI run attempted first (Codex-first); session sandbox was read-only, so patch was prepared and then applied in workspace.
- 2026-02-17T05:45:00Z Updated `scripts/audit-migration-parity.mjs` to support `ASTRO_BLOG_ROOT` override.
- 2026-02-17T05:45:00Z Added `scripts/verify-migration-audit-gate.mjs` to run isolated negative-fixture verification and auto-restore canonical audit reports.
- 2026-02-17T05:45:00Z Added npm script `audit:migration:verify-gate` in `package.json`.
- 2026-02-17T05:46:00Z Validation run passed: `npm run audit:migration && npm run build`.
- 2026-02-17T05:46:00Z Negative gate verification passed: `npm run audit:migration:verify-gate`.
- 2026-02-17T05:46:00Z CI/deploy check: workflow still gates with `Audit migration parity` step; latest successful run `22085766746` deployed to publish repo commit `57bed91e1705def2d3fe730df758911b2cbd8f9f`.

## Decisions
- Decision: Use temporary fixture copy + env override instead of mutating real content.
- Rationale: Keeps workspace content stable while enabling deterministic negative-case verification.
- Decision: Verification script re-runs normal audit in `finally` to restore `docs/MIGRATION_AUDIT.md` / `.json`.
- Rationale: Prevents negative test artifacts from polluting committed migration audit reports.
