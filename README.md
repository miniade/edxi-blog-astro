# edxi-blog-astro

Astro source repository for migrating the old Hexo-generated static blog.

## Repositories

- **Source repo (this one):** `miniade/edxi-blog-astro`
  - Astro project code
  - Markdown/MDX source content
  - Build pipeline
- **Publish repo (target):** `miniade/edxi.github.io-blog`
  - Built static files only (HTML/CSS/JS/assets)
  - Used as GitHub Pages deploy output

## Local development

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Deployment flow

On push to `main`, GitHub Actions:

1. Installs deps
2. Builds Astro into `dist/`
3. Pushes `dist/` to `miniade/edxi.github.io-blog` branch `master`

Workflow file:

- `.github/workflows/deploy-to-publish-repo.yml`

## Required secret

Set this repository secret in **`miniade/edxi-blog-astro`**:

- `PUBLISH_REPO_TOKEN` : a PAT with write access to `miniade/edxi.github.io-blog`

You can set it with GitHub CLI:

```bash
gh secret set PUBLISH_REPO_TOKEN --repo miniade/edxi-blog-astro
```

## Migration status

- [x] Astro scaffold initialized
- [x] Build passes locally
- [x] Deploy workflow to publish repo prepared
- [ ] Static HTML -> Markdown extraction pipeline
- [ ] Real post migration + URL compatibility checks
