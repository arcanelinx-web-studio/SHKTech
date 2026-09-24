import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const out = new URL(process.env.REVIEW_DIR || '../outputs/review/', import.meta.url);
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
const report = { responsive: [], routeResponsive: [], accessibility: [], errors };
for (const width of [1920, 1728, 1440, 1366, 1280, 1024, 768, 430, 412, 390, 375, 360]) {
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

const criticalRoutes = [
  '/',
  '/products/',
  '/products/chip-compactors/',
  '/services/laser-calibration/',
  '/solutions/accuracy/',
  '/enquiry/',
  '/about/',
];
for (const width of [1920, 1728, 1440, 1366, 1024, 768, 430, 412, 390, 375, 360]) {
  await page.setViewportSize({ width, height: 1000 });
  for (const route of criticalRoutes) {
    await page.goto(base + route);
    const overflow = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      viewport: innerWidth,
    }));
    report.routeResponsive.push({ route, width, ...overflow });
  }
}
for (const [route, width] of [
  ['/products/', 1440],
  ['/products/', 390],
  ['/enquiry/', 1440],
  ['/enquiry/', 390],
]) {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto(base + route);
  await page.screenshot({
    path: fileURLToPath(new URL(`${route.replaceAll('/', '') || 'home'}-${width}.png`, out)),
    fullPage: true,
  });
}

// Realistic viewport-height checks across desktop, tablet and phone classes.
report.deviceProfiles = [];
for (const profile of [
  { name: 'desktop-1366x768', width: 1366, height: 768 },
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'tablet-1024x768', width: 1024, height: 768 },
  { name: 'tablet-768x1024', width: 768, height: 1024 },
  { name: 'phone-430x932', width: 430, height: 932 },
  { name: 'phone-412x915', width: 412, height: 915 },
  { name: 'phone-390x844', width: 390, height: 844 },
  { name: 'phone-375x812', width: 375, height: 812 },
  { name: 'phone-360x800', width: 360, height: 800 },
]) {
  await page.setViewportSize({ width: profile.width, height: profile.height });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto(base + '/');
  const metrics = await page.evaluate(() => {
    const header = document.querySelector('.site-header')?.getBoundingClientRect();
    const hero = document.querySelector('.hero')?.getBoundingClientRect();
    const contactBar = document.querySelector('.contact-bar')?.getBoundingClientRect();
    return {
      scroll: document.documentElement.scrollWidth,
      viewport: innerWidth,
      headerHeight: header?.height || 0,
      heroWidth: hero?.width || 0,
      contactBarWidth: contactBar?.width || 0,
    };
  });
  report.deviceProfiles.push({ ...profile, ...metrics });
}

// Ensure OS dark mode cannot auto-recolour the intentionally mixed SHK art direction.
report.darkMode = [];
for (const profile of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'phone', width: 390, height: 844 },
]) {
  await page.setViewportSize({ width: profile.width, height: profile.height });

  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto(base + '/');
  const light = await page.evaluate(() => {
    const requirement = getComputedStyle(document.querySelector('.requirement'));
    const header = getComputedStyle(document.querySelector('.site-header'));
    const form = getComputedStyle(document.querySelector('.requirement-form'));
    const problems = getComputedStyle(document.querySelector('.problems-source'));
    const problemCard = getComputedStyle(document.querySelector('.problem-source-card'));
    const explorer = getComputedStyle(document.querySelector('.explorer'));
    const zoneStage = getComputedStyle(document.querySelector('.zone-stage'));
    const primary = getComputedStyle(document.querySelector('.button-primary'));
    return {
      requirementBg: requirement.backgroundColor,
      requirementColor: requirement.color,
      headerBg: header.backgroundColor,
      headerColor: header.color,
      formBg: form.backgroundColor,
      formColor: form.color,
      problemsBg: problems.backgroundColor,
      problemCardBg: problemCard.backgroundColor,
      explorerBg: explorer.backgroundColor,
      explorerColor: explorer.color,
      zoneStageBg: zoneStage.backgroundColor,
      zoneStageColor: zoneStage.color,
      primaryBg: primary.backgroundColor,
      primaryColor: primary.color,
    };
  });

  await page.emulateMedia({ colorScheme: 'dark' });
  await page.reload();
  const dark = await page.evaluate(() => {
    const requirement = getComputedStyle(document.querySelector('.requirement'));
    const header = getComputedStyle(document.querySelector('.site-header'));
    const form = getComputedStyle(document.querySelector('.requirement-form'));
    const problems = getComputedStyle(document.querySelector('.problems-source'));
    const problemCard = getComputedStyle(document.querySelector('.problem-source-card'));
    const explorer = getComputedStyle(document.querySelector('.explorer'));
    const zoneStage = getComputedStyle(document.querySelector('.zone-stage'));
    const primary = getComputedStyle(document.querySelector('.button-primary'));
    return {
      requirementBg: requirement.backgroundColor,
      requirementColor: requirement.color,
      headerBg: header.backgroundColor,
      headerColor: header.color,
      formBg: form.backgroundColor,
      formColor: form.color,
      problemsBg: problems.backgroundColor,
      problemCardBg: problemCard.backgroundColor,
      explorerBg: explorer.backgroundColor,
      explorerColor: explorer.color,
      zoneStageBg: zoneStage.backgroundColor,
      zoneStageColor: zoneStage.color,
      primaryBg: primary.backgroundColor,
      primaryColor: primary.color,
    };
  });

  report.darkMode.push({ ...profile, light, dark, same: JSON.stringify(light) === JSON.stringify(dark) });
}
await page.emulateMedia({ colorScheme: 'light' });

// Final visual consistency checks for the brand lockup and section 02.
report.visualConsistency = [];
for (const profile of [
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'phone-430', width: 430, height: 932 },
  { name: 'phone-390', width: 390, height: 844 },
  { name: 'phone-360', width: 360, height: 800 },
]) {
  await page.setViewportSize({ width: profile.width, height: profile.height });
  await page.goto(base + '/');
  const state = await page.evaluate(() => {
    const visible = (el) => {
      if (!el) return false;
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0;
    };
    const brandSub = document.querySelector('.site-header .brand-sub');
    const meta = document.querySelector('.zone-panel-meta');
    const metaItems = meta ? [...meta.querySelectorAll('.mono')] : [];
    const left = metaItems[0]?.getBoundingClientRect();
    const right = metaItems[1]?.getBoundingClientRect();
    return {
      brandSubSize: brandSub ? parseFloat(getComputedStyle(brandSub).fontSize) : 0,
      machineVisible: visible(document.querySelector('.machine-drawing')),
      zoneStageVisible: visible(document.querySelector('.zone-stage')),
      accordionVisible: visible(document.querySelector('.mobile-zone-list')),
      metaGap: left && right ? right.left - left.right : 0,
      contactBarVisible: visible(document.querySelector('.contact-bar')),
    };
  });
  report.visualConsistency.push({ ...profile, ...state });

  const explorer = page.locator('.explorer');
  await explorer.screenshot({
    path: fileURLToPath(new URL(`explorer-${profile.name}.png`, out)),
  });
}

await page.emulateMedia({ colorScheme: 'light' });

// Product-detail visual QA: this catches the exact issues found in final review
// (undersized specifications and awkward application-first callout).
report.productDetailVisual = [];
for (const profile of [
  { name: 'detail-1440', width: 1440, height: 1000 },
  { name: 'detail-768', width: 768, height: 1024 },
  { name: 'detail-390', width: 390, height: 844 },
]) {
  await page.setViewportSize({ width: profile.width, height: profile.height });
  await page.goto(base + '/products/chip-compactors/');

  const state = await page.evaluate(() => {
    const container = document.querySelector('.technical-details')?.getBoundingClientRect();
    const tableWrap = document.querySelector('.technical-details .table-scroll')?.getBoundingClientRect();
    const aside = document.querySelector('.application-aside')?.getBoundingClientRect();
    const action = document.querySelector('.application-aside .button')?.getBoundingClientRect();
    const whatsapp = document.querySelector('.application-aside .whatsapp-cta')?.getBoundingClientRect();
    return {
      viewport: innerWidth,
      scroll: document.documentElement.scrollWidth,
      technicalWidth: container?.width || 0,
      tableWidth: tableWrap?.width || 0,
      tableRatio: container && tableWrap ? tableWrap.width / container.width : 0,
      asideWidth: aside?.width || 0,
      asideRight: aside?.right || 0,
      actionHeight: action?.height || 0,
      whatsappHeight: whatsapp?.height || 0,
      featureMarker: (() => {
        const li = document.querySelector('.feature-list li');
        if (!li) return { width: 0, height: 0, background: '' };
        const marker = getComputedStyle(li, '::before');
        return {
          width: parseFloat(marker.width) || 0,
          height: parseFloat(marker.height) || 0,
          background: marker.backgroundColor || '',
        };
      })(),
    };
  });

  report.productDetailVisual.push({ ...profile, ...state });
  await page.screenshot({
    path: fileURLToPath(new URL(`${profile.name}.png`, out)),
    fullPage: true,
  });
}

await page.emulateMedia({ colorScheme: 'light' });

await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto(base + '/');
await page.locator('[data-zone="05"]').click();
if (await page.locator('[data-zone-detail="05"]').getAttribute('hidden'))
  throw Error('Desktop zone panel did not activate');
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
await page.locator('[data-zone="04"]').click();
if (await page.locator('[data-zone-detail="04"]').getAttribute('hidden'))
  throw Error('Mobile machine zone panel did not activate');
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
  'Pass: desktop/mobile hotspots, plot, deduplication, navigation persistence, notes, removal and menu';
await writeFile(new URL('browser-report.json', out), JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    {
      ...report,
      accessibility: report.accessibility.map((a) => ({
        route: a.route,
        violations: a.violations.length,
        ids: a.violations.map((v) => v.id),
      })),
    },
    null,
    2,
  ),
);
await browser.close();
if (
  report.responsive.some((r) => r.scroll > r.viewport) ||
  report.routeResponsive.some((r) => r.scroll > r.viewport) ||
  report.accessibility.some((a) => a.violations.length) ||
  report.deviceProfiles.some((r) => r.scroll > r.viewport) ||
  report.darkMode.some((r) => !r.same) ||
  report.visualConsistency.some((r) =>
    r.brandSubSize < 8 ||
    !r.machineVisible ||
    !r.zoneStageVisible ||
    r.accordionVisible ||
    r.metaGap < 8 ||
    (r.width <= 600 ? !r.contactBarVisible : r.contactBarVisible)
  ) ||
  report.productDetailVisual.some((r) =>
    r.scroll > r.viewport ||
    r.tableRatio < 0.82 ||
    r.asideRight > r.viewport + 1 ||
    r.actionHeight > 64 ||
    r.whatsappHeight > 56 ||
    r.featureMarker.width < 5 ||
    r.featureMarker.height < 5
  ) ||
  errors.length
)
  process.exitCode = 1;
