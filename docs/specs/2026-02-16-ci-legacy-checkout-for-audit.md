# Task: Fix CI migration audit legacy source path

## Goal
Repair GitHub Actions migration audit step so it can access legacy static posts in CI environment and enforce parity gate correctly.

## Scope
- In scope:
  - Update deploy workflow to checkout `miniade/edxi.github.io-blog` into the sibling path expected by `scripts/audit-migration-parity.mjs`.
  - Re-run workflow and confirm success.
- Out of scope:
  - Refactoring audit script path resolution.
  - Replacing legacy data source with snapshot artifact.

## Plan
1. Confirm CI failure root cause from failed run logs.
2. Patch workflow with additional checkout step before audit.
3. Push and verify GitHub Actions success.
4. Update spec and memory records.

## Risks
- Additional checkout may increase job runtime.
- Cross-repo checkout permissions must remain available to `GITHUB_TOKEN`.

## Validation
- [x] Build passes (`npm run build`)
- [x] Key routes/features verified (`npm run audit:migration`; also verified env override path `LEGACY_BLOG_ROOT=../edxi.github.io-blog`)
- [x] Deployment workflow passes (GitHub Actions run `22067157146`; parity `missing=0, extra=0`)

## Change Log
- 2026-02-16T13:21:00Z Created spec after CI failure analysis (`ENOENT ../edxi.github.io-blog`).
- 2026-02-16T13:23:00Z Added workflow checkout for `miniade/edxi.github.io-blog` before audit.
- 2026-02-16T13:24:00Z Fixed checkout path restriction by moving checkout under workspace (`legacy-source`) and wiring `LEGACY_BLOG_ROOT` env into audit step.
- 2026-02-16T13:25:00Z Updated audit script to support configurable legacy root via `LEGACY_BLOG_ROOT` env while preserving default local sibling fallback.
- 2026-02-16T13:26:00Z Local validation passed: `npm run audit:migration`, `LEGACY_BLOG_ROOT=../edxi.github.io-blog npm run audit:migration`, `npm run build`.
- 2026-02-16T13:29:00Z Corrected CI audit data source from publish repo (`miniade/edxi.github.io-blog`) to true legacy static repo (`edxi/edxi.github.io`) to avoid false diff signal (`legacy=0, extra=20`).

- 2026-02-16T16:14:34Z Verified deployment/CI workflow success via GitHub Actions run `22067157146`; migration parity remained `missing=0, extra=0`.

## Decisions
- Decision: Introduce `LEGACY_BLOG_ROOT` env override in audit script instead of hardcoding only one legacy path.
- Rationale: Works in both local dual-repo workspace and GitHub Actions sandbox path constraints.
- Decision: In CI, checkout the actual legacy static source repo (`edxi/edxi.github.io`) to `legacy-source/` (within workspace) and set `LEGACY_BLOG_ROOT=legacy-source`.
- Rationale: publish repo content evolves with Astro deploys and is not a stable legacy baseline; using upstream legacy repo avoids false positives/negatives.
- Decision: Mark deployment/CI validation complete using run `22067157146`.
- Rationale: Successful GitHub Actions evidence confirms parity gate and deploy path after push.
