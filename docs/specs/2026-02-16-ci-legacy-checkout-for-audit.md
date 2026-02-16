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
- [ ] Build passes
- [ ] Key routes/features verified
- [ ] Deployment workflow passes

## Change Log
- 2026-02-16T13:21:00Z Created spec after CI failure analysis (`ENOENT ../edxi.github.io-blog`).

## Decisions
- Decision: Keep audit script legacy path contract unchanged and satisfy it in CI by checking out publish repo as sibling path.
- Rationale: Fastest minimal fix with lowest code churn and immediate compatibility.
