import { readdir, readFile, stat, writeFile, mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
const root = resolve('dist');
const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) await walk(p);
    else files.push(p);
  }
}
await walk(root);
const failures = [];
let htmlCount = 0;
let links = 0;
for (const file of files.filter((f) => f.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  htmlCount++;
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) failures.push(`${file}: H1 count`);
  if (html.includes('\uFFFD')) failures.push(`${file}: invalid encoding`);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  if (new Set(ids).size !== ids.length) failures.push(`${file}: duplicate IDs`);
  for (const match of html.matchAll(/href="(\/(?!\/)[^"]*)"/g)) {
    const href = match[1].split(/[?#]/)[0];
    if (!href) continue;
    const target = join(root, decodeURIComponent(href));
    try {
      const entry = await stat(target);
      if (entry.isDirectory()) await stat(join(target, 'index.html'));
      links++;
    } catch {
      failures.push(`${file}: missing ${href}`);
    }
  }
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))
    try {
      JSON.parse(m[1]);
    } catch {
      failures.push(`${file}: invalid JSON-LD`);
    }
}
const js = files.filter((f) => f.endsWith('.js'));
const bytes = (await Promise.all(js.map(async (p) => (await stat(p)).size))).reduce(
  (a, b) => a + b,
  0,
);
const report = {
  pages: htmlCount,
  internalLinksChecked: links,
  javascriptFiles: js.length,
  totalJavaScriptBytes: bytes,
  failures,
};
await mkdir('outputs/review', { recursive: true });
await writeFile('outputs/review/build-audit.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
