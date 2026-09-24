import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const dist = new URL('../dist/', import.meta.url);
const rawBase = process.env.BASE_PATH || '/SHKTech';
const base = '/' + rawBase.replace(/^\\/+|\\/+$/g, '');
const segment = base.slice(1).replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&');
const attrPattern = new RegExp(
  '(\\\\b(?:href|src|action|poster)=["\\\'])\\\\/(?!\\\\/|' + segment + '(?:\\\\/|["\\\']))',
  'g',
);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(path);
      continue;
    }
    if (extname(entry.name) !== '.html') continue;

    const original = await readFile(path, 'utf8');
    const rewritten = original.replace(attrPattern, '$1' + base + '/');
    if (rewritten !== original) await writeFile(path, rewritten);
  }
}

await walk(dist);
console.log('Prepared GitHub Pages preview for base path ' + base + '/');
