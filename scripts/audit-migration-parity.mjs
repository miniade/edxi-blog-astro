import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const legacyRoot = process.env.LEGACY_BLOG_ROOT
  ? path.resolve(process.cwd(), process.env.LEGACY_BLOG_ROOT)
  : path.resolve(__dirname, '..', '..', 'edxi.github.io-blog');
const astroRoot = path.resolve(__dirname, '..', 'src', 'content', 'blog');
const markdownReportPath = path.resolve(__dirname, '..', 'docs', 'MIGRATION_AUDIT.md');
const jsonReportPath = path.resolve(__dirname, '..', 'docs', 'MIGRATION_AUDIT.json');
const legacyPathPattern = /^\/\d{4}\/\d{2}\/\d{2}\/([^/]+)\/$/;

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

function extractFrontmatter(source) {
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  return match ? match[1] : '';
}

function normalizeYamlScalar(value) {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return '';
  }

  const startsWithQuote = trimmed.startsWith('"') || trimmed.startsWith("'");
  const endsWithQuote = trimmed.endsWith('"') || trimmed.endsWith("'");
  if (startsWithQuote && endsWithQuote && trimmed.length >= 2) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function parseFrontmatterString(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)\\s*$`, 'm'));
  if (!match) {
    return '';
  }

  return normalizeYamlScalar(match[1]);
}

async function getLegacyData() {
  const files = await walkFiles(legacyRoot);
  const slugSet = new Set();
  const pathSet = new Set();
  const legacyPattern = /(^|\/)(\d{4})\/(\d{2})\/(\d{2})\/([^/]+)\/index\.html$/;

  for (const filePath of files) {
    const relative = toPosixPath(path.relative(legacyRoot, filePath));
    const match = relative.match(legacyPattern);
    if (!match) {
      continue;
    }
    slugSet.add(match[5]);
    pathSet.add(`/${match[2]}/${match[3]}/${match[4]}/${match[5]}/`);
  }

  return {
    legacySlugs: Array.from(slugSet).sort((a, b) => a.localeCompare(b)),
    legacyPaths: Array.from(pathSet).sort((a, b) => a.localeCompare(b)),
  };
}

async function getAstroPosts() {
  const files = await walkFiles(astroRoot);
  const slugSet = new Set();
  const legacyPathSet = new Set();
  const posts = [];

  for (const filePath of files) {
    if (!filePath.endsWith('.md') && !filePath.endsWith('.mdx')) {
      continue;
    }

    const filenameSlug = path.basename(filePath).replace(/\.(md|mdx)$/i, '');
    slugSet.add(filenameSlug);

    const relativePath = toPosixPath(path.relative(astroRoot, filePath));
    const source = await fs.readFile(filePath, 'utf8');
    const frontmatter = extractFrontmatter(source);
    const legacyPath = parseFrontmatterString(frontmatter, 'legacyPath');

    if (legacyPathPattern.test(legacyPath)) {
      legacyPathSet.add(legacyPath);
    }

    posts.push({
      file: relativePath,
      filenameSlug,
      legacySlug: parseFrontmatterString(frontmatter, 'legacySlug'),
      legacyPath,
    });
  }

  return {
    astroSlugs: Array.from(slugSet).sort((a, b) => a.localeCompare(b)),
    astroLegacyPaths: Array.from(legacyPathSet).sort((a, b) => a.localeCompare(b)),
    posts,
  };
}

function validateMetadata(posts) {
  const missingLegacySlug = [];
  const missingLegacyPath = [];
  const duplicateLegacySlug = [];
  const duplicateLegacyPath = [];
  const malformedLegacyPath = [];
  const filenameSlugMismatchWarning = [];
  const legacySlugToFiles = new Map();
  const legacyPathToFiles = new Map();

  for (const post of posts) {
    if (!post.legacySlug) {
      missingLegacySlug.push(post.file);
    } else {
      const existing = legacySlugToFiles.get(post.legacySlug) ?? [];
      existing.push(post.file);
      legacySlugToFiles.set(post.legacySlug, existing);
    }

    if (!post.legacyPath) {
      missingLegacyPath.push(post.file);
    } else {
      const existing = legacyPathToFiles.get(post.legacyPath) ?? [];
      existing.push(post.file);
      legacyPathToFiles.set(post.legacyPath, existing);

      const match = post.legacyPath.match(legacyPathPattern);
      if (!match) {
        malformedLegacyPath.push({
          file: post.file,
          legacyPath: post.legacyPath,
          reason: 'must match /YYYY/MM/DD/slug/',
        });
      } else if (post.legacySlug && match[1] !== post.legacySlug) {
        malformedLegacyPath.push({
          file: post.file,
          legacyPath: post.legacyPath,
          reason: `path slug "${match[1]}" does not match legacySlug "${post.legacySlug}"`,
        });
      }
    }

    if (post.legacySlug && post.filenameSlug !== post.legacySlug) {
      filenameSlugMismatchWarning.push({
        file: post.file,
        filenameSlug: post.filenameSlug,
        legacySlug: post.legacySlug,
      });
    }
  }

  for (const [legacySlug, files] of legacySlugToFiles.entries()) {
    if (files.length > 1) {
      duplicateLegacySlug.push({ legacySlug, files: [...files].sort((a, b) => a.localeCompare(b)) });
    }
  }

  for (const [legacyPath, files] of legacyPathToFiles.entries()) {
    if (files.length > 1) {
      duplicateLegacyPath.push({ legacyPath, files: [...files].sort((a, b) => a.localeCompare(b)) });
    }
  }

  const hasFindings =
    missingLegacySlug.length > 0 ||
    missingLegacyPath.length > 0 ||
    duplicateLegacySlug.length > 0 ||
    duplicateLegacyPath.length > 0 ||
    malformedLegacyPath.length > 0 ||
    filenameSlugMismatchWarning.length > 0;

  return {
    missingLegacySlug: missingLegacySlug.sort((a, b) => a.localeCompare(b)),
    missingLegacyPath: missingLegacyPath.sort((a, b) => a.localeCompare(b)),
    duplicateLegacySlug: duplicateLegacySlug.sort((a, b) => a.legacySlug.localeCompare(b.legacySlug)),
    duplicateLegacyPath: duplicateLegacyPath.sort((a, b) => a.legacyPath.localeCompare(b.legacyPath)),
    malformedLegacyPath: malformedLegacyPath.sort((a, b) => a.file.localeCompare(b.file)),
    filenameSlugMismatchWarning: filenameSlugMismatchWarning.sort((a, b) => a.file.localeCompare(b.file)),
    hasFindings,
  };
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

function renderDuplicateLegacySlugs(items) {
  if (items.length === 0) {
    return '- (none)';
  }

  return items
    .map((item) => `- \`${item.legacySlug}\`: ${item.files.map((file) => `\`${file}\``).join(', ')}`)
    .join('\n');
}

function renderDuplicateLegacyPaths(items) {
  if (items.length === 0) {
    return '- (none)';
  }

  return items
    .map((item) => `- \`${item.legacyPath}\`: ${item.files.map((file) => `\`${file}\``).join(', ')}`)
    .join('\n');
}

function renderMalformedLegacyPaths(items) {
  if (items.length === 0) {
    return '- (none)';
  }

  return items
    .map((item) => `- \`${item.file}\`: \`${item.legacyPath}\` (${item.reason})`)
    .join('\n');
}

function renderFilenameSlugWarnings(items) {
  if (items.length === 0) {
    return '- (none)';
  }

  return items
    .map((item) => `- \`${item.file}\`: filename slug \`${item.filenameSlug}\`, legacySlug \`${item.legacySlug}\``)
    .join('\n');
}

function buildReport(data) {
  const timestamp = data.generatedAt;
  const {
    totalLegacyPosts,
    totalAstroPosts,
    missingInAstro,
    extraInAstro,
    missingPathsInAstro,
    extraPathsInAstro,
    warnings,
    metadataFindings,
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
    `- Missing paths in Astro: ${missingPathsInAstro.length}`,
    `- Extra paths in Astro: ${extraPathsInAstro.length}`,
    `- Missing legacySlug: ${metadataFindings.missingLegacySlug.length}`,
    `- Missing legacyPath: ${metadataFindings.missingLegacyPath.length}`,
    `- Duplicate legacySlug: ${metadataFindings.duplicateLegacySlug.length}`,
    `- Duplicate legacyPath: ${metadataFindings.duplicateLegacyPath.length}`,
    `- Malformed legacyPath: ${metadataFindings.malformedLegacyPath.length}`,
    `- Filename/legacySlug mismatch warnings: ${metadataFindings.filenameSlugMismatchWarning.length}`,
    `- Warnings: ${warnings.length}`,
    '',
    '## Diffs',
    '',
    '### Missing in Astro (present in legacy)',
    renderList(missingInAstro),
    '',
    '### Extra in Astro (not present in legacy)',
    renderList(extraInAstro),
    '',
    '### Missing Paths in Astro (present in legacy)',
    renderList(missingPathsInAstro),
    '',
    '### Extra Paths in Astro (not present in legacy)',
    renderList(extraPathsInAstro),
    '',
    '## Metadata Integrity',
    '',
    '### Missing legacySlug',
    renderList(metadataFindings.missingLegacySlug),
    '',
    '### Missing legacyPath',
    renderList(metadataFindings.missingLegacyPath),
    '',
    '### Duplicate legacySlug',
    renderDuplicateLegacySlugs(metadataFindings.duplicateLegacySlug),
    '',
    '### Duplicate legacyPath',
    renderDuplicateLegacyPaths(metadataFindings.duplicateLegacyPath),
    '',
    '### Malformed legacyPath',
    renderMalformedLegacyPaths(metadataFindings.malformedLegacyPath),
    '',
    '### Filename slug mismatch warnings',
    renderFilenameSlugWarnings(metadataFindings.filenameSlugMismatchWarning),
    '',
  ].join('\n');
}

async function writeReport(content) {
  await fs.mkdir(path.dirname(markdownReportPath), { recursive: true });
  await fs.writeFile(markdownReportPath, content, 'utf8');
}

async function writeJsonReport(summary) {
  await fs.mkdir(path.dirname(jsonReportPath), { recursive: true });
  await fs.writeFile(jsonReportPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
}

async function main() {
  const warnings = [];

  try {
    const generatedAt = new Date().toISOString();
    const [legacyData, astroData] = await Promise.all([
      getLegacyData(),
      getAstroPosts(),
    ]);

    const missingInAstro = makeDiff(legacyData.legacySlugs, astroData.astroSlugs);
    const extraInAstro = makeDiff(astroData.astroSlugs, legacyData.legacySlugs);
    const missingPathsInAstro = makeDiff(legacyData.legacyPaths, astroData.astroLegacyPaths);
    const extraPathsInAstro = makeDiff(astroData.astroLegacyPaths, legacyData.legacyPaths);
    const metadataFindings = validateMetadata(astroData.posts);
    const hasDiffs =
      missingInAstro.length > 0 ||
      extraInAstro.length > 0 ||
      missingPathsInAstro.length > 0 ||
      extraPathsInAstro.length > 0 ||
      metadataFindings.hasFindings;

    console.log(
      `Audit parity summary: legacy=${legacyData.legacySlugs.length}, astro=${astroData.astroSlugs.length}, missing=${missingInAstro.length}, extra=${extraInAstro.length}, missingPaths=${missingPathsInAstro.length}, extraPaths=${extraPathsInAstro.length}`,
    );

    if (missingInAstro.length > 0) {
      warnings.push('Legacy posts are missing from Astro content.');
    }

    if (extraInAstro.length > 0) {
      warnings.push('Astro posts exist without a matching legacy slug.');
    }

    if (missingPathsInAstro.length > 0) {
      warnings.push('Legacy URL paths are missing from Astro legacyPath mappings.');
    }

    if (extraPathsInAstro.length > 0) {
      warnings.push('Astro legacyPath mappings exist without matching legacy URL paths.');
    }

    if (metadataFindings.missingLegacySlug.length > 0) {
      warnings.push('Some Astro posts are missing legacySlug.');
    }

    if (metadataFindings.missingLegacyPath.length > 0) {
      warnings.push('Some Astro posts are missing legacyPath.');
    }

    if (metadataFindings.duplicateLegacySlug.length > 0) {
      warnings.push('Duplicate legacySlug values detected.');
    }

    if (metadataFindings.duplicateLegacyPath.length > 0) {
      warnings.push('Duplicate legacyPath values detected.');
    }

    if (metadataFindings.malformedLegacyPath.length > 0) {
      warnings.push('Malformed legacyPath values detected.');
    }

    if (metadataFindings.filenameSlugMismatchWarning.length > 0) {
      warnings.push('Filename slug and legacySlug mismatch warnings detected.');
    }

    const counts = {
      totalLegacyPosts: legacyData.legacySlugs.length,
      totalAstroPosts: astroData.astroSlugs.length,
      missingInAstro: missingInAstro.length,
      extraInAstro: extraInAstro.length,
      missingPathsInAstro: missingPathsInAstro.length,
      extraPathsInAstro: extraPathsInAstro.length,
      missingLegacySlug: metadataFindings.missingLegacySlug.length,
      missingLegacyPath: metadataFindings.missingLegacyPath.length,
      duplicateLegacySlug: metadataFindings.duplicateLegacySlug.length,
      duplicateLegacyPath: metadataFindings.duplicateLegacyPath.length,
      malformedLegacyPath: metadataFindings.malformedLegacyPath.length,
      filenameSlugMismatchWarning: metadataFindings.filenameSlugMismatchWarning.length,
    };

    const summary = {
      generatedAt,
      totalLegacyPosts: legacyData.legacySlugs.length,
      totalAstroPosts: astroData.astroSlugs.length,
      missingInAstro,
      extraInAstro,
      missingPathsInAstro,
      extraPathsInAstro,
      metadataFindings,
      warnings,
      summary: {
        counts,
        warningsCount: warnings.length,
      },
      hasDiffs,
    };

    const report = buildReport(summary);

    await Promise.all([
      writeReport(report),
      writeJsonReport(summary),
    ]);
    if (hasDiffs) {
      process.exitCode = 1;
    }
  } catch (error) {
    const generatedAt = new Date().toISOString();
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Migration audit failed: ${message}`);
    process.exitCode = 1;

    const fallbackSummary = {
      generatedAt,
      totalLegacyPosts: 0,
      totalAstroPosts: 0,
      missingInAstro: [],
      extraInAstro: [],
      missingPathsInAstro: [],
      extraPathsInAstro: [],
      metadataFindings: {
        missingLegacySlug: [],
        missingLegacyPath: [],
        duplicateLegacySlug: [],
        duplicateLegacyPath: [],
        malformedLegacyPath: [],
        filenameSlugMismatchWarning: [],
        hasFindings: false,
      },
      warnings: [`Audit failed: ${message}`],
      summary: {
        counts: {
          totalLegacyPosts: 0,
          totalAstroPosts: 0,
          missingInAstro: 0,
          extraInAstro: 0,
          missingPathsInAstro: 0,
          extraPathsInAstro: 0,
          missingLegacySlug: 0,
          missingLegacyPath: 0,
          duplicateLegacySlug: 0,
          duplicateLegacyPath: 0,
          malformedLegacyPath: 0,
          filenameSlugMismatchWarning: 0,
        },
        warningsCount: 1,
      },
      hasDiffs: false,
    };

    const fallbackReport = buildReport(fallbackSummary);

    await Promise.all([
      writeReport(fallbackReport),
      writeJsonReport(fallbackSummary),
    ]);
  }
}

await main();
