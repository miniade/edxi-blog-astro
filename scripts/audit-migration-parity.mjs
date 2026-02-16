import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const legacyRoot = path.resolve(__dirname, '..', '..', 'edxi.github.io-blog');
const astroRoot = path.resolve(__dirname, '..', 'src', 'content', 'blog');
const reportPath = path.resolve(__dirname, '..', 'docs', 'MIGRATION_AUDIT.md');

async function walkFiles(dir) {
  const files = [];
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  dirents.sort((a, b) => a.name.localeCompare(b.name));

  for (const dirent of dirents) {
    const fullPath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
      continue;
    }
    if (dirent.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

async function getLegacySlugs() {
  const files = await walkFiles(legacyRoot);
  const slugSet = new Set();
  const legacyPattern = /(^|\/)\d{4}\/\d{2}\/\d{2}\/([^/]+)\/index\.html$/;

  for (const filePath of files) {
    const relative = toPosixPath(path.relative(legacyRoot, filePath));
    const match = relative.match(legacyPattern);
    if (!match) {
      continue;
    }
    slugSet.add(match[2]);
  }

  return Array.from(slugSet).sort((a, b) => a.localeCompare(b));
}

async function getAstroSlugs() {
  const files = await walkFiles(astroRoot);
  const slugSet = new Set();

  for (const filePath of files) {
    if (!filePath.endsWith('.md') && !filePath.endsWith('.mdx')) {
      continue;
    }

    const slug = path.basename(filePath).replace(/\.(md|mdx)$/i, '');
    slugSet.add(slug);
  }

  return Array.from(slugSet).sort((a, b) => a.localeCompare(b));
}

function makeDiff(left, right) {
  const rightSet = new Set(right);
  return left.filter((value) => !rightSet.has(value));
}

function renderList(items) {
  if (items.length === 0) {
    return '- (none)';
  }

  return items.map((item) => `- \`${item}\``).join('\n');
}

function buildReport(data) {
  const timestamp = new Date().toISOString();
  const {
    totalLegacyPosts,
    totalAstroPosts,
    missingInAstro,
    extraInAstro,
    warnings,
  } = data;

  const warningSection = warnings.length > 0
    ? `${warnings.map((line) => `WARNING: ${line}`).join('\n')}\n\n`
    : '';

  return [
    '# Migration Audit Report',
    '',
    `Generated (UTC): ${timestamp}`,
    '',
    warningSection + '## Summary',
    '',
    `- Total legacy posts: ${totalLegacyPosts}`,
    `- Total Astro posts: ${totalAstroPosts}`,
    `- Missing in Astro: ${missingInAstro.length}`,
    `- Extra in Astro: ${extraInAstro.length}`,
    '',
    '## Diffs',
    '',
    '### Missing in Astro (present in legacy)',
    renderList(missingInAstro),
    '',
    '### Extra in Astro (not present in legacy)',
    renderList(extraInAstro),
    '',
  ].join('\n');
}

async function writeReport(content) {
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, content, 'utf8');
}

async function main() {
  const warnings = [];

  try {
    const [legacySlugs, astroSlugs] = await Promise.all([
      getLegacySlugs(),
      getAstroSlugs(),
    ]);

    const missingInAstro = makeDiff(legacySlugs, astroSlugs);
    const extraInAstro = makeDiff(astroSlugs, legacySlugs);
    const hasDiffs = missingInAstro.length > 0 || extraInAstro.length > 0;

    console.log(
      `Audit parity summary: legacy=${legacySlugs.length}, astro=${astroSlugs.length}, missing=${missingInAstro.length}, extra=${extraInAstro.length}`,
    );

    if (missingInAstro.length > 0) {
      warnings.push('Legacy posts are missing from Astro content.');
    }

    if (extraInAstro.length > 0) {
      warnings.push('Astro posts exist without a matching legacy slug.');
    }

    const report = buildReport({
      totalLegacyPosts: legacySlugs.length,
      totalAstroPosts: astroSlugs.length,
      missingInAstro,
      extraInAstro,
      warnings,
    });

    await writeReport(report);
    if (hasDiffs) {
      process.exitCode = 1;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Migration audit failed: ${message}`);
    process.exitCode = 1;
    const fallbackReport = buildReport({
      totalLegacyPosts: 0,
      totalAstroPosts: 0,
      missingInAstro: [],
      extraInAstro: [],
      warnings: [`Audit failed: ${message}`],
    });

    await writeReport(fallbackReport);
  }
}

await main();
