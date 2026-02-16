# Task: Batch-2 static HTML -> Astro markdown migration

## Goal
Migrate the next batch of legacy posts from static Hexo-generated HTML into Astro content markdown files with reproducible tooling.

## Scope
- In scope:
  - Improve importer script ergonomics (CLI file inputs)
  - Import next 10 posts (excluding first migrated 3)
  - Build validation
  - Push and verify CI deploy
- Out of scope:
  - Full-site migration
  - URL redirect compatibility layer

## Plan
1. Update `scripts/import-static-posts.mjs` to accept input file list from CLI args.
2. Select next 10 posts from legacy static repo.
3. Run importer for those 10 pages.
4. Validate with `npm run build`.
5. Commit code + docs and push.

## Risks
- HTML-to-Markdown conversion quality differs across posts.
- Legacy internal links may still point to old structure.

## Validation
- [x] Build passes
- [x] New markdown files generated under `src/content/blog/`
- [x] Deployment workflow passes

## Change Log
- 2026-02-16: Spec created.
- 2026-02-16: Updated importer to support CLI paths.
- 2026-02-16: Imported 10 additional posts and verified local build.

## Decisions
- Decision: Continue migration in controlled batches (10 posts/batch).
- Rationale: Easier QA and rollback.
