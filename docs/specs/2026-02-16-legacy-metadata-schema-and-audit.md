# Task: Legacy metadata schema coverage and audit hardening

## Goal
Ensure migrated posts keep explicit legacy mapping metadata in typed schema and make migration audit fail fast when metadata is missing/invalid.

## Scope
- In scope:
  - Extend Astro content schema for migrated blog metadata (`tags`, `categories`, `legacySlug`, `legacyPath`)
  - Harden migration audit script with metadata checks (missing fields, duplicate mappings, malformed paths)
  - Keep markdown/json audit reports compatible while adding metadata warning sections
- Out of scope:
  - Re-importing post body content
  - Theme/layout redesign

## Plan
1. Add schema fields for migration metadata in `src/content.config.ts`.
2. Enhance `scripts/audit-migration-parity.mjs` to parse frontmatter and validate metadata constraints.
3. Run validation (`npm run audit:migration`, `npm run build`).
4. Update spec changelog/decisions and commit together.

## Risks
- Frontmatter parsing edge cases may cause false positives.
- New strict checks could fail CI if any existing post metadata is inconsistent.

## Validation
- [x] Build passes (`npm run build`)
- [x] Key routes/features verified (build generated all blog routes; audit reports `hasDiffs=false`)
- [ ] Deployment workflow passes

## Change Log
- 2026-02-16T19:16:00Z Spec created.
- 2026-02-16T19:17:00Z Codex-first execution used for implementation planning; local patch applied to `src/content.config.ts` and `scripts/audit-migration-parity.mjs`.
- 2026-02-16T19:17:33Z Ran `npm run audit:migration`; summary `legacy=20, astro=20, missing=0, extra=0`, metadata findings all zero, `hasDiffs=false`.
- 2026-02-16T19:17:40Z Ran `npm run build`; build succeeded (23 pages).

## Decisions
- Decision: Add metadata integrity checks directly into existing migration parity audit.
- Rationale: Keep a single CI gate for migration completeness + mapping quality.
- Decision: Keep slug parity based on filename-derived Astro slugs while layering metadata integrity checks as additive gates.
- Rationale: Preserve compatibility with existing parity behavior and increase migration safety.
- Decision: Treat filename/legacySlug mismatches as warning-class findings that still set `hasDiffs=true`.
- Rationale: Any mapping drift should fail fast in CI to prevent silent regressions.
