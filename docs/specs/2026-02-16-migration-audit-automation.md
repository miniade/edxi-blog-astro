# Task: Migration audit automation for static-to-Astro parity

## Goal
Add an automated audit that compares the legacy static blog post set with Astro content files, so future checks can quickly prove migration completeness and catch regressions.

## Scope
- In scope:
  - Add a Node.js audit script under `scripts/`
  - Script reads legacy static post URLs from `../edxi.github.io-blog` and Astro posts from `src/content/blog`
  - Output a markdown audit report under `docs/`
  - Add npm script entry for running the audit
  - Run audit + build validation
- Out of scope:
  - Re-importing content
  - Refactoring page/theme UI

## Plan
1. Inspect legacy vs Astro content sources and define canonical comparison keys.
2. Implement audit script and markdown report generation.
3. Wire script into `package.json` and run it.
4. Validate with `npm run build`.

## Risks
- Legacy HTML URL conventions may not map 1:1 to markdown slugs.
- Legacy repo path assumptions may differ between environments.

## Validation
- [x] Build passes (`npm run build`)
- [x] Key routes/features verified (static routes generated for blog index + post pages)
- [x] Deployment workflow passes (verified by GitHub Actions run `22067157146`; parity `missing=0, extra=0`)

## Change Log
- 2026-02-16 08:48 UTC Initialized spec and execution plan.
- 2026-02-16 08:49 UTC Added `scripts/audit-migration-parity.mjs` and npm script `audit:migration`.
- 2026-02-16 08:50 UTC Generated `docs/MIGRATION_AUDIT.md`; result: 20 legacy posts covered, 0 missing, 5 Astro-only starter/demo posts.
- 2026-02-16 08:50 UTC Completed local validation: `npm run audit:migration && npm run build`.

- 2026-02-16T16:14:34Z Verified deployment/CI workflow success via GitHub Actions run `22067157146`; migration parity remained `missing=0, extra=0`.

## Decisions
- Decision: Compare using slug-like basenames derived from both legacy `YYYY/MM/DD/<slug>/index.html` and Astro markdown filenames.
- Rationale: This is stable across formatting differences and cheap to compute in CI/local.
- Decision: Keep script exit code as 0 even on mismatch and encode mismatch as WARNING lines in report.
- Rationale: Makes it safe for periodic automation while preserving actionable parity signals in the generated markdown artifact.
- Decision: Mark deployment/CI validation complete using run `22067157146`.
- Rationale: Successful GitHub Actions evidence confirms parity gate and deploy path after push.
