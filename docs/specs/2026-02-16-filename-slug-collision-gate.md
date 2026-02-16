# Task: Filename Slug Collision Gate for Migration Audit

## Goal
Harden migration parity checks by detecting duplicate Astro filename slugs across nested folders so route-level content collisions cannot slip through parity checks.

## Scope
- In scope:
  - Enhance `scripts/audit-migration-parity.mjs` to detect duplicate `filenameSlug` mappings.
  - Include findings in Markdown/JSON reports and fail-fast gating logic.
  - Update CI summary output counters to include the new check.
- Out of scope:
  - Content rewrites of migrated posts.
  - Astro route refactor beyond audit checks.

## Plan
1. Add `duplicateFilenameSlug` detection in metadata validation.
2. Surface findings in report rendering and JSON summary counters.
3. Ensure warnings + `hasDiffs` include this finding.
4. Run `npm run audit:migration` and `npm run build`.

## Risks
- Existing legitimate multi-path content patterns might be flagged if filename slug reuse is intentional.
- Report schema extension may require workflow summary updates.

## Validation
- [x] Build passes (`npm run build`)
- [x] Key routes/features verified (`npm run audit:migration`: `duplicateFilenameSlug=0`)
- [x] Deployment workflow passes (`Build and Deploy to publish repo` run `22080900268`)

## Change Log
- 2026-02-16T23:46:00Z Spec created.
- 2026-02-16T23:47:00Z Updated `scripts/audit-migration-parity.mjs` to detect `duplicateFilenameSlug` and include it in fail-fast findings, warnings, report sections, and JSON summary counters.
- 2026-02-16T23:47:02Z Validation passed locally: `npm run audit:migration` and `npm run build`.
- 2026-02-16T23:49:00Z Pushed commit `329dce5`; GitHub Actions run `22080900268` succeeded and publish repo updated to `deploy: miniade/edxi-blog-astro@329dce5...` (`c56b4eb`).

## Decisions
- Decision: Treat duplicate filename slug as fail-fast finding, not informational warning only.
- Rationale: Duplicate filename slugs can map to ambiguous route expectations and undermine migration parity confidence.
- Decision: Keep `duplicateFilenameSlug` under existing `metadataFindings` schema.
- Rationale: Reuses current report/CI interpretation path without introducing a second integrity namespace.
