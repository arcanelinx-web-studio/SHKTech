import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';
import { mkdir, writeFile } from 'node:fs/promises';
const out = new URL(process.env.REVIEW_DIR || '../outputs/review/', import.meta.url);
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ['--remote-debugging-port=9223'],
});
try {
  const result = await lighthouse(process.env.BASE_URL || 'http://127.0.0.1:4322/', {
    port: 9223,
    output: ['html', 'json'],
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    logLevel: 'error',
  });
  await writeFile(new URL('lighthouse-mobile.html', out), result.report[0]);
  await writeFile(new URL('lighthouse-mobile.json', out), result.report[1]);
  console.log(
    JSON.stringify(
      {
        scores: Object.fromEntries(
          Object.entries(result.lhr.categories).map(([k, v]) => [k, Math.round(v.score * 100)]),
        ),
        metrics: Object.fromEntries(
          [
            'first-contentful-paint',
            'largest-contentful-paint',
            'cumulative-layout-shift',
            'total-blocking-time',
          ].map((k) => [k, result.lhr.audits[k].displayValue]),
        ),
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
