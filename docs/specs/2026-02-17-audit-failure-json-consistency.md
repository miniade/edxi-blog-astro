# Task: Migration audit failure JSON consistency

## Goal
Ensure `docs/MIGRATION_AUDIT.json` accurately signals failure state when `audit:migration` encounters runtime errors, so CI summaries and downstream automation do not misread hard failures as clean parity.

## Scope
- In scope:
  - Fix fallback JSON fields in `scripts/audit-migration-parity.mjs` catch path.
  - Add explicit error marker in JSON output for failure scenarios.
  - Regenerate audit artifacts and run minimum validation.
- Out of scope:
  - Changing parity comparison rules.
  - Refactoring report rendering structure unrelated to failure semantics.

## Plan
1. Update audit script failure fallback summary to keep failure semantics (`hasDiffs=true`, warning/findings consistency).
2. Regenerate audit reports via `npm run audit:migration`.
3. Validate build via `npm run build`.
4. Record changelog and decisions.

## Risks
- JSON schema drift could break existing consumers if not backward-compatible.
- Incorrect fallback values could still hide runtime errors.

## Validation
- [x] Build passes (`npm run build`)
- [x] Key routes/features verified (`npm run audit:migration`: `legacy=20, astro=20, missing=0, extra=0, missingPaths=0, extraPaths=0`)
- [ ] Deployment workflow passes

## Change Log
- 2026-02-17T01:14:18Z Spec created for migration audit fallback JSON consistency fix.
- 2026-02-17T01:15:00Z Attempted Codex CLI execution first (`codex exec`); environment was read-only, so patch plan was produced and then applied locally to target file.
- 2026-02-17T01:15:18Z Updated `scripts/audit-migration-parity.mjs` catch fallback summary: added `errorMessage`, switched `metadataFindings.hasFindings` to `true`, and switched `hasDiffs` to `true` for explicit failure semantics.
- 2026-02-17T01:15:25Z Ran validation: `npm run audit:migration` and `npm run build` both passed.

## Decisions
- Decision: Keep existing JSON shape and only add failure-safe fields/values.
- Rationale: Minimize downstream impact while correcting failure signaling.
- Decision: Add top-level `errorMessage` instead of replacing `warnings`.
- Rationale: Preserve backward compatibility while giving machine consumers a stable failure field.
