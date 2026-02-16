# Task: Migration parity cleanup

## Goal
Clean up Astro starter/template posts that are not part of the legacy migration set, so migration parity audit no longer reports Astro-only noise.

## Scope
- In scope:
- Remove Astro-only starter/sample posts listed in `docs/MIGRATION_AUDIT.md` under `Extra in Astro`.
- Re-run migration audit and build, and update migration audit report.
- Record implementation, decisions, and validation in this spec.
- Out of scope:
- Any content edits for legacy-mapped posts.
- Changes to migration audit logic.

## Plan
1. Create this spec before implementation.
2. Delete Astro-only starter/sample post files reported by migration audit.
3. Run `npm run audit:migration` and `npm run build`.
4. Update `docs/MIGRATION_AUDIT.md` output and complete spec `Change Log` / `Decisions` / `Validation`.
5. Commit code and docs together.

## Risks
- Removing wrong content files could regress migrated legacy coverage.
- Removing MDX sample content could fail if any page/layout references it directly.
- Audit output can become stale if not regenerated after file changes.

## Validation
- [x] Build passes
- [x] Key routes/features verified
- [ ] Deployment workflow passes
- [x] `npm run audit:migration` reports no unexpected extras

## Change Log
- 2026-02-16: Spec created for migration parity cleanup.
- 2026-02-16: Removed Astro-only starter/sample posts (`first-post`, `markdown-style-guide`, `second-post`, `third-post`, `using-mdx`).
- 2026-02-16: Re-ran migration audit; `docs/MIGRATION_AUDIT.md` now reports 0 missing and 0 extras.
- 2026-02-16: Ran `npm run build`; static build completed successfully with blog routes generated.

## Decisions
- Decision: Remove Astro starter/sample posts listed in migration audit extras.
- Rationale: They are outside the legacy migration collection and create parity noise.
- Decision: Keep deployment workflow validation unchecked in this task.
- Rationale: This task validates local migration parity/build only; CI run verification is outside current execution scope.
