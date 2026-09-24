import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const out = new URL(process.env.REVIEW_DIR || '../../../outputs/review/', import.meta.url);
await mkdir(out, { recursive: true });
const base = process.env.BASE_URL || 'http://127.0.0.1:4321';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
await page.goto(base + '/');
await page.evaluate(() => document.fonts.ready);
const report = { responsive: [], accessibility: [], errors };
for (const width of [1440, 1280, 1024, 768, 430, 390, 360]) {
  await page.setViewportSize({ width, height: 1000 });
  await page.evaluate(async () => {
    for (const img of document.images) {
      img.loading = 'eager';
    }
    await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
  });
  await page.screenshot({
    path: fileURLToPath(new URL(`home-${width}.png`, out)),
    fullPage: true,
  });
  const overflow = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    viewport: innerWidth,
  }));
  report.responsive.push({ width, ...overflow });
}
await page.setViewportSize({ width: 1440, height: 1000 });
await page.locator('[data-zone="05"]').click();
if (
  !(await page
    .locator('[data-zone-panel="05"]')
    .getAttribute('open')
    .then((v) => v !== null))
)
  throw Error('Zone did not open');
await page.locator('[data-plot="compensated"]').click();
if ((await page.locator('#plot-compensated').getAttribute('visibility')) !== 'visible')
  throw Error('Plot did not change');
await page.locator('[data-add-enquiry]').first().click();
await page.locator('[data-add-enquiry]').first().click();
if ((await page.locator('[data-enquiry-count]').innerText()) !== '1') throw Error('Duplicate item');
await page.reload();
if ((await page.locator('[data-enquiry-count]').innerText()) !== '1')
  throw Error('Persistence failed');
await page.goto(base + '/enquiry/');
await page.locator('.enquiry-row textarea').fill('Review interface');
await page.locator('main h1').click();
await page.reload();
if ((await page.locator('.enquiry-row textarea').inputValue()) !== 'Review interface')
  throw Error('Note persistence failed');
await page.locator('[name="name"]').fill('QA Engineer');
await page.locator('[name="phone"]').fill('9999999999');
await page.locator('[name="details"]').fill('Check fixture compatibility & bore Ø100.');
await page.evaluate(() => {
  window.open = (url) => {
    window.__opened = url;
    return null;
  };
});
await page.locator('.form-submit').click();
const msg = await page.evaluate(() => new URL(window.__opened).searchParams.get('text'));
if (
  !msg.includes('Rotary & tilting tables') ||
  !msg.includes('Review interface') ||
  !msg.includes('Ø100')
)
  throw Error('WhatsApp missing requirement');
report.whatsapp = 'Pass: selected items, notes, encoding and reference';
await page.locator('.enquiry-row button').click();
if (await page.locator('.enquiry-row').count()) throw Error('Remove failed');
for (const route of [
  '/',
  '/products/',
  '/products/chip-compactors/',
  '/services/laser-calibration/',
  '/enquiry/',
  '/about/',
]) {
  await page.goto(base + route);
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  report.accessibility.push({
    route,
    violations: axe.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
    })),
  });
}
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(base + '/');
await page.locator('.menu-toggle').click();
if (!(await page.locator('#mobile-menu').isVisible())) throw Error('Mobile menu failed');
await page.keyboard.press('Escape');
if (await page.locator('#mobile-menu').isVisible()) throw Error('Escape failed');
await page.locator('[data-zone-panel="04"] summary').click();
if ((await page.locator('.zone[open]').count()) !== 1)
  throw Error('Accordion opens multiple zones');
const mobileAxe = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
  .analyze();
report.accessibility.push({
  route: '/ (390px)',
  violations: mobileAxe.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
  })),
});
await page.goto(base + '/products/rotary-tables/');
await page.getByRole('link', { name: 'Ask an Engineer', exact: true }).click();
await page.waitForURL((url) => url.hash === '#requirement');
if ((await page.locator('[name="category"]').inputValue()) !== 'Rotary & tilting tables')
  throw Error('Category context lost');
await page.waitForFunction(
  () => Math.abs(document.querySelector('#requirement').getBoundingClientRect().top) < 150,
);
await page.locator('[name="name"]').fill('QA');
await page.locator('[name="details"]').fill('Review setup');
await page.locator('.form-submit').click();
if (!(await page.locator('#form-error').innerText()).includes('phone number or email'))
  throw Error('Contact validation failed');
await page.goto(base + '/products/');
await page.locator('[data-add-enquiry]').first().click();
await page.locator('[data-add-enquiry]').nth(1).click();
const second = await context.newPage();
await second.goto(base + '/enquiry/');
await page.locator('[data-add-enquiry]').nth(2).click();
await second.waitForFunction(() => document.querySelectorAll('.enquiry-row').length === 3);
await second.close();
await page.goto(base + '/enquiry/');
page.once('dialog', (dialog) => dialog.accept());
await page.locator('#clear-enquiry').click();
if (await page.locator('.enquiry-row').count()) throw Error('Clear failed');
report.additional =
  'Pass: mobile axe audit, form deep-link context/scroll, contact validation, cross-tab sync, clear list';
report.interactions =
  'Pass: hotspots, plot, deduplication, navigation persistence, notes, removal, menu and mobile accordion';
await writeFile(new URL('browser-report.json', out), JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    {
      ...report,
      accessibility: report.accessibility.map((a) => ({
        route: a.route,
        violations: a.violations.length,
      })),
    },
    null,
    2,
  ),
);
await browser.close();
if (
  report.responsive.some((r) => r.scroll > r.viewport) ||
  report.accessibility.some((a) => a.violations.length) ||
  errors.length
)
  process.exitCode = 1;
