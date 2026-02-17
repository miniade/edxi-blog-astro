import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const sourceBlogRoot = path.resolve(repoRoot, 'src', 'content', 'blog');
const auditScriptPath = path.resolve(repoRoot, 'scripts', 'audit-migration-parity.mjs');
const auditJsonPath = path.resolve(repoRoot, 'docs', 'MIGRATION_AUDIT.json');

function extractFrontmatter(source) {
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  return match ? match[1] : '';
}

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

async function findTargetPost(blogRoot) {
  const files = await walkFiles(blogRoot);

  for (const filePath of files) {
    if (!filePath.endsWith('.md') && !filePath.endsWith('.mdx')) {
      continue;
    }

    const source = await fs.readFile(filePath, 'utf8');
    const frontmatter = extractFrontmatter(source);

    if (!frontmatter) {
      continue;
    }

    const hasPubDate = /^pubDate:\s*.+$/m.test(frontmatter);
    const hasLegacyPath = /^legacyPath:\s*.+$/m.test(frontmatter);

    if (hasPubDate && hasLegacyPath) {
      return filePath;
    }
  }

  return '';
}

async function mutatePubDate(filePath) {
  const source = await fs.readFile(filePath, 'utf8');
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);

  if (!match) {
    throw new Error(`No frontmatter found in ${filePath}`);
  }

  const frontmatter = match[1];

  if (!/^pubDate:\s*.+$/m.test(frontmatter)) {
    throw new Error(`No pubDate found in ${filePath}`);
  }

  const nextFrontmatter = frontmatter.replace(/^(\s*pubDate:\s*).+$/m, '$12099-01-01');
  if (nextFrontmatter === frontmatter) {
    throw new Error(`Failed to mutate pubDate in ${filePath}`);
  }

  const mutated = source.replace(frontmatter, nextFrontmatter);
  await fs.writeFile(filePath, mutated, 'utf8');
}

function runAudit(extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [auditScriptPath], {
      cwd: repoRoot,
      env: { ...process.env, ...extraEnv },
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`Audit process terminated by signal: ${signal}`));
        return;
      }

      resolve(code ?? 1);
    });
  });
}

async function main() {
  const failures = [];
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'migration-audit-gate-'));
  const tempBlogRoot = path.join(tempRoot, 'blog');

  try {
    await fs.cp(sourceBlogRoot, tempBlogRoot, { recursive: true });

    const targetFile = await findTargetPost(tempBlogRoot);
    if (!targetFile) {
      throw new Error('No markdown file found with both pubDate and legacyPath frontmatter.');
    }

    await mutatePubDate(targetFile);

    const negativeExitCode = await runAudit({ ASTRO_BLOG_ROOT: tempBlogRoot });
    if (negativeExitCode === 0) {
      failures.push('Expected audit to fail for mutated fixture, but it exited with code 0.');
    }

    const reportRaw = await fs.readFile(auditJsonPath, 'utf8');
    const report = JSON.parse(reportRaw);
    const mismatchCount = report?.summary?.counts?.pubDateLegacyPathDateMismatch;
    if (typeof mismatchCount !== 'number' || mismatchCount < 1) {
      failures.push(`Expected pubDateLegacyPathDateMismatch >= 1, got ${String(mismatchCount)}.`);
    }

    if (report?.hasDiffs !== true) {
      failures.push(`Expected hasDiffs=true, got ${String(report?.hasDiffs)}.`);
    }
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
  } finally {
    try {
      const restoreExitCode = await runAudit();
      if (restoreExitCode !== 0) {
        failures.push(`Failed to restore docs/MIGRATION_AUDIT.md and docs/MIGRATION_AUDIT.json via normal audit (exit ${restoreExitCode}).`);
      }
    } catch (error) {
      failures.push(`Failed to restore docs/MIGRATION_AUDIT.md and docs/MIGRATION_AUDIT.json via normal audit: ${error instanceof Error ? error.message : String(error)}`);
    }

    await fs.rm(tempRoot, { recursive: true, force: true });
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`VERIFY FAILED: ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Migration audit gate verification passed.');
}

await main();
