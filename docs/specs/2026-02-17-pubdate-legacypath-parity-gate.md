# Task: pubDate and legacyPath parity gate hardening

## Goal
Ensure migration audit enforces metadata parity between post frontmatter `pubDate` and the date segments in `legacyPath` (`/YYYY/MM/DD/slug/`) so date drift is surfaced and blocks audit pass.

## Scope
- In scope:
  - Update `scripts/audit-migration-parity.mjs` to parse `pubDate`.
  - Add metadata findings for pubDate/legacyPath date mismatches.
  - Include mismatch counts in markdown/json summaries.
  - Add warning text and gate failure behavior when mismatches exist.
- Out of scope:
  - Rewriting post content metadata.
  - Changing slug/path parity semantics beyond date parity.

## Plan
1. Extend Astro post metadata extraction to include `pubDate`.
2. Add UTC date parsing helper and compare `pubDate` date parts to `legacyPath` date parts.
3. Record mismatches in `metadataFindings.pubDateLegacyPathDateMismatch`.
4. Update report rendering and JSON summary counts/warnings.
5. Validate via `npm run audit:migration` and `npm run build`.

## Risks
- UTC normalization may expose existing timezone-related drift that previously went unnoticed.
- Invalid or missing `pubDate` values may now fail the gate and require content cleanup.

## Implementation Notes
- Keep mismatch reporting under `metadataFindings` for consistency with existing gates.
- Treat missing/unparseable `pubDate` as mismatches when `legacyPath` is date-parseable.
- Do not add new top-level report structures; append to current summary and metadata sections.

## Validation
- [x] `npm run audit:migration` passes with zero pubDate/legacyPath date mismatches.
- [x] `npm run build` passes.
- [x] `docs/MIGRATION_AUDIT.md` includes mismatch summary and metadata section.
- [x] `docs/MIGRATION_AUDIT.json` includes mismatch findings/counts and warning propagation.
- [ ] Audit gate fails when an intentional pubDate/legacyPath mismatch is introduced.

## Change Log
- 2026-02-17T04:18:00Z Created spec for pubDate/legacyPath parity gate hardening.
- 2026-02-17T04:18:00Z Planned script updates to enforce pubDate date parity in metadata findings, summaries, warnings, and fail gate semantics.
- 2026-02-17T04:19:00Z Implemented `pubDateLegacyPathDateMismatch` metadata finding in `scripts/audit-migration-parity.mjs` with UTC date normalization and gate-failing semantics.
- 2026-02-17T04:20:00Z Regenerated `docs/MIGRATION_AUDIT.md` / `docs/MIGRATION_AUDIT.json` via `npm run audit:migration`; local parity remains `missing=0, extra=0, missingPaths=0, extraPaths=0`.
- 2026-02-17T04:21:00Z Ran `npm run build` successfully (23 pages).

## Decisions
- Decision: Compare `pubDate` against `legacyPath` using UTC date parts.
- Rationale: Provides deterministic behavior across environments and timezones.
- Decision: Treat pubDate date mismatches as hard findings (gate-failing).
- Rationale: Date path parity is migration integrity metadata and should not be advisory.
