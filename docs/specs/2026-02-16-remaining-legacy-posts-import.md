# Task: Import Remaining Legacy Static Posts (Batch)

## Goal
Import the remaining seven specified legacy HTML posts into Astro markdown content using the existing importer script, then validate the site build.

## Scope
- In scope:
- Import exactly 7 provided legacy `index.html` files via `scripts/import-static-posts.mjs`.
- Generate/update corresponding markdown files in `src/content/blog/`.
- Run `npm run build` and confirm success.
- Record execution details and decisions.
- Out of scope:
- Script refactors or importer behavior changes.
- Content rewriting beyond importer output.
- Deployment execution.

## Plan
1. Run importer with the exact 7 target file paths as CLI args.
2. Review generated markdown files and verify filenames/content presence.
3. Run full build validation (`npm run build`).
4. Update this spec with changelog and decisions.
5. Commit code and docs together.

## Risks
- Legacy HTML edge cases (tables/code blocks/links) may convert imperfectly.
- Frontmatter values from source pages may need future manual cleanup.

## Validation
- [x] Build passes
- [x] Key routes/features verified
- [ ] Deployment workflow passes

## Change Log
- 2026-02-16T00:00:00Z Spec created for remaining legacy post import batch.
- 2026-02-16T05:44:44Z Imported 7 legacy HTML posts via `node scripts/import-static-posts.mjs <exact-targets>`, generating markdown files for `PowerShellPipeline`, `PowerShell_Study`, `DSCwinrm`, `WinBaseline`, `PoshBotVMware`, `LinuxPowerCLI`, and `NexusYum`.
- 2026-02-16T05:44:44Z Ran `npm run build` successfully; build generated 28 pages including new blog routes for the imported posts.

## Decisions
- Decision: Use existing importer with CLI-specified targets instead of changing default `targets` list.
- Rationale: Keeps script reusable and limits this batch strictly to requested files.
- Decision: Leave deployment workflow validation unchecked in this task.
- Rationale: Current batch scope requires local import + build verification only; deployment verification is handled in deployment-specific workflow steps.
