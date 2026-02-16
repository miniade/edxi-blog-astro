# Task: Preserve migration audit report in CI artifacts

## Goal
Ensure `docs/MIGRATION_AUDIT.md` is always captured from GitHub Actions runs (success or failure) so migration parity drift diagnostics are available without rerunning locally.

## Scope
- In scope:
  - Update deploy workflow to upload `docs/MIGRATION_AUDIT.md` as an artifact.
  - Configure upload step to run even if audit/build fails.
  - Keep existing audit gate and deploy behavior unchanged.
- Out of scope:
  - Changes to audit matching logic.
  - New workflows or release process changes.

## Plan
1. Create this spec before implementation.
2. Use Codex CLI to patch `.github/workflows/deploy-to-publish-repo.yml` with an always-run artifact upload step after audit/build.
3. Run local validation (`npm run audit:migration`, `npm run build`).
4. Update changelog/decisions and commit docs+code together.

## Risks
- Artifact step path mismatch if audit output location changes.
- Additional workflow runtime/storage overhead.

## Validation
- [x] Build passes
- [x] Key routes/features verified
- [x] Deployment workflow passes

## Change Log
- 2026-02-16T14:47:00Z Spec created.
- 2026-02-16T14:45:00Z Updated `.github/workflows/deploy-to-publish-repo.yml` to always upload `docs/MIGRATION_AUDIT.md` as artifact `migration-audit-report` using `actions/upload-artifact@v4`.
- 2026-02-16T14:45:00Z Local validation passed: `npm run audit:migration` (summary `legacy=20, astro=20, missing=0, extra=0`) and `npm run build`.
- 2026-02-16T14:46:00Z Pushed commit `829631d`; GitHub Actions run `22067130331` succeeded with new artifact upload step and deploy completed.
- 2026-02-16T14:47:00Z Publish repo `miniade/edxi.github.io-blog` updated to `deploy: miniade/edxi-blog-astro@829631d...` (`origin/master` -> `2ac95e7`).

## Decisions
- Decision: Upload migration audit report with an `if: always()` workflow step.
- Rationale: Keep parity diagnostics available for both successful and failed CI runs without altering deploy gate semantics.
