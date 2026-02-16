# Task: Enforce migration parity audit in CI

## Goal
Add migration parity audit as a required CI step in the deploy workflow so any future content drift (missing/extra legacy slugs) is caught before deployment.

## Scope
- In scope:
  - Update GitHub Actions workflow to run `npm run audit:migration` before build/deploy.
  - Keep existing deployment behavior unchanged.
  - Validate locally with audit + build.
- Out of scope:
  - Refactoring audit script logic.
  - Adding new CI workflows.

## Plan
1. Modify `.github/workflows/deploy-to-publish-repo.yml` to include an explicit migration audit step after dependency install.
2. Run local validation (`npm run audit:migration`, `npm run build`).
3. Update this spec with changelog and decisions.
4. Commit and push code+docs together.

## Risks
- Audit script currently writes `docs/MIGRATION_AUDIT.md`; CI will fail only on script non-zero exits, so parity failure criteria must remain in script behavior.
- Any future intentional extra content may require explicit policy adjustment.

## Validation
- [x] `npm run audit:migration` passes
- [x] `npm run build` passes
- [x] CI run succeeds after push (GitHub Actions run `22067157146`; parity `missing=0, extra=0`)

## Change Log
- 2026-02-16T11:46:00Z Spec created for CI migration parity audit gate.
- 2026-02-16T11:44:20Z Added `Audit migration parity` step to `.github/workflows/deploy-to-publish-repo.yml` immediately after `npm ci` and before `npm run build`.
- 2026-02-16T11:47:30Z Ran local validation: `npm run audit:migration` and `npm run build` both succeeded.

- 2026-02-16T16:14:34Z Verified deployment/CI workflow success via GitHub Actions run `22067157146`; migration parity remained `missing=0, extra=0`.

## Decisions
- Decision: Place audit before build in deploy workflow.
- Rationale: Fail fast on migration parity issues to avoid unnecessary build/deploy work.
- Decision: Keep deploy action and publish target unchanged while introducing the audit gate.
- Rationale: Reduce regression risk by changing only the minimum needed CI path.
- Decision: Mark deployment/CI validation complete using run `22067157146`.
- Rationale: Successful GitHub Actions evidence confirms parity gate and deploy path after push.
