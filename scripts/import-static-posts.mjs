import fs from 'node:fs/promises';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';

const workspace = '/home/edxi/.openclaw/agents/blog/workspace';
const staticRoot = path.join(workspace, 'edxi.github.io-blog');
const outputDir = path.join(workspace, 'edxi-blog-astro', 'src', 'content', 'blog');

const targets = [
  '2018/07/09/Terraform_vSphere/index.html',
  '2018/07/09/DockerMachine_vSphere/index.html',
  '2018/07/09/Shadowsocks_Privoxy_Squid_GFWlist/index.html',
];

function toAbsUrl(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return `https://edxi.github.io${url}`;
  return url;
}

function normalizeSlug(file) {
  const parts = file.split('/');
  return parts[3];
}

function extractCodeFromHighlight(figure) {
  const lines = [...figure.querySelectorAll('td.code .line')].map((el) => el.textContent ?? '');
  return lines.join('\n').replace(/\n+$/, '');
}

function frontmatterEscape(text = '') {
  return String(text).replace(/"/g, '\\"');
}

async function convertOne(relPath) {
  const fullPath = path.join(staticRoot, relPath);
  const html = await fs.readFile(fullPath, 'utf8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const title = doc.querySelector('h1.post-title')?.textContent?.trim() || normalizeSlug(relPath);
  const time = doc.querySelector('time[itemprop*="datePublished"]');
  const pubDate = time?.getAttribute('datetime') || '2018-01-01T00:00:00+08:00';
  const description = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';

  const tags = [...doc.querySelectorAll('.post-tags a')]
    .map((a) => a.textContent?.replace(/^#\s*/, '').trim())
    .filter(Boolean);

  const categories = [...doc.querySelectorAll('.post-category [itemprop="name"]')]
    .map((el) => el.textContent?.trim())
    .filter(Boolean);

  const body = doc.querySelector('.post-body[itemprop="articleBody"]');
  if (!body) throw new Error(`No .post-body found: ${relPath}`);

  // cleanup noisy blocks
  body.querySelectorAll('link, script, style, #footnotes').forEach((el) => el.remove());
  body.querySelectorAll('a#more').forEach((el) => el.remove());

  // normalize images/links
  body.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src');
    if (src) img.setAttribute('src', toAbsUrl(src));
  });
  body.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href) a.setAttribute('href', toAbsUrl(href));
  });

  // convert Hexo highlight blocks into plain pre>code before markdown conversion
  body.querySelectorAll('figure.highlight').forEach((figure) => {
    const code = extractCodeFromHighlight(figure);
    const pre = doc.createElement('pre');
    const codeEl = doc.createElement('code');
    codeEl.textContent = code;
    pre.appendChild(codeEl);
    figure.replaceWith(pre);
  });

  const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
  turndown.addRule('removeHeaderLinks', {
    filter: (node) => node.nodeName === 'A' && (node.getAttribute('class') || '').includes('headerlink'),
    replacement: () => '',
  });

  const markdown = turndown.turndown(body.innerHTML).trim();

  const slug = normalizeSlug(relPath);
  const outFile = path.join(outputDir, `${slug}.md`);
  const fm = `---\ntitle: "${frontmatterEscape(title)}"\npubDate: ${pubDate}\ndescription: "${frontmatterEscape(description.slice(0, 180))}"\ntags: [${tags.map((t) => `"${frontmatterEscape(t)}"`).join(', ')}]\ncategories: [${categories.map((c) => `"${frontmatterEscape(c)}"`).join(', ')}]\nlegacySlug: "${slug}"\nlegacyPath: "/${relPath.replace('/index.html', '/')}"\n---\n\n`;

  await fs.writeFile(outFile, fm + markdown + '\n', 'utf8');
  return { relPath, outFile, title };
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const cliTargets = process.argv.slice(2);
  const selectedTargets = cliTargets.length > 0 ? cliTargets : targets;
  const results = [];
  for (const t of selectedTargets) {
    results.push(await convertOne(t));
  }

  console.log('Imported posts:');
  for (const r of results) {
    console.log(`- ${r.relPath} -> ${path.relative(process.cwd(), r.outFile)} (${r.title})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
