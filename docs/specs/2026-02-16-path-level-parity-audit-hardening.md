# Task: Path-level parity audit hardening

## Goal
Add path-level migration parity checks so audit validates full legacy URL keys (`/YYYY/MM/DD/slug/`) in addition to slug-level parity and fails when path-level drift exists.

## Scope
- In scope:
  - Update `scripts/audit-migration-parity.mjs` to compute and enforce path-level parity.
  - Update report outputs in `docs/MIGRATION_AUDIT.md` and `docs/MIGRATION_AUDIT.json`.
  - Add summary counts/warnings for path-level parity.
- Out of scope:
  - Re-importing content.
  - Route/rendering changes.

## Plan
1. Extend legacy/Astro data collection to include full normalized legacy path keys.
2. Add `missingPathsInAstro` and `extraPathsInAstro` diffs and fold into fail-fast condition.
3. Update markdown/json report sections and summary counts/warnings.
4. Run `npm run audit:migration` and `npm run build`.
5. Update this spec with validation/checklist/changelog.

## Risks
- `legacyPath` normalization mismatch could introduce false positives if formatting deviates from `/YYYY/MM/DD/slug/`.
- Path-level checks increase strictness and may fail CI on previously hidden mapping drift.

## Validation
- [x] `npm run audit:migration` passes.
- [x] `npm run build` passes.
- [x] Path-level report sections are present and zero when parity is clean.
- [ ] Deployment workflow passes.

## Change Log
- 2026-02-16T20:50:00Z Created spec for path-level parity hardening.
- 2026-02-16T20:50:00Z Implemented script/report/json support for path-level parity diffs (`missingPathsInAstro` / `extraPathsInAstro`) and wired them into fail-fast logic.
- 2026-02-16T20:51:00Z Updated deployment workflow step summary output to include path-level parity counts from `docs/MIGRATION_AUDIT.json`.
- 2026-02-16T20:47:38Z Ran `npm run audit:migration` successfully (summary: `legacy=20, astro=20, missing=0, extra=0, missingPaths=0, extraPaths=0`).
- 2026-02-16T20:47:45Z Ran `npm run build` successfully (23 pages built).

## Decisions
- Decision: Treat path-level parity diffs as hard failures (same as slug-level diffs).
- Rationale: Prevent silent drift where slug parity passes but date-path mapping regresses.
- Decision: Source Astro path parity from valid `legacyPath` metadata.
- Rationale: Path parity is a mapping integrity check, so it should use explicit migration metadata.
