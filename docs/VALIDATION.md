# Foundation validation

Validated against a local production build in Google Chrome on Windows. Automated checks complement the rendered visual review; they are not a substitute for client acceptance or native-device testing.

- `npm install`: completed; lockfile committed.
- `npm run check`: Astro and TypeScript, zero errors, warnings or hints.
- `npm test`: four passing tests covering WhatsApp formatting/encoding, empty fields, invalid stored data, duplicate entries and reference generation.
- `npm run build`: 33 static pages, image optimization, robots and sitemap generation completed.
- Browser checks at 1440, 1280, 1024, 768, 430, 390 and 360 CSS pixels: no document horizontal overflow.
- Interaction checks: machine hotspots, single-open mobile accordion, circularity plot toggle, duplicate prevention, count updates, navigation/refresh persistence, per-item notes, removal, clear list and cross-tab sync.
- Enquiry checks: category context and form scrolling, contact validation, structured WhatsApp link encoding with notes/items and Unicode. External WhatsApp navigation is intercepted during tests; no message is sent.
- axe WCAG 2 A/AA and 2.1 AA: zero violations on the homepage, product index, compactor category, laser service, enquiry and about pages, plus the homepage at 390 pixels.
- No page errors or browser console errors in those workflows.
- Static build audit: 1,322 internal link occurrences checked; no missing target, invalid JSON-LD, duplicate ID, replacement character or H1-count failures across 33 HTML pages.
- Four generated JS files total approximately 8.2 kB uncompressed across the entire build; no React runtime.
- Official logo SVG SHA-256 values match the original source files.
- npm dependency audit: zero known vulnerabilities at validation time.

## Reproduce

Start `npm run preview -- --port 4322` after building, then:

```powershell
$env:BASE_URL='http://127.0.0.1:4322'
npm run test:browser
node tests/build-audit.mjs
node tests/performance.mjs
```

The Lighthouse test uses installed Chrome, mobile simulation and port 9223 for its temporary browser. Results vary with the machine, browser, network and hosting; local scores are not a production SLA. JSON/HTML reports and breakpoint screenshots are delivered separately in the task's output directory.

Native Android/iOS WhatsApp handoff, the final domain, real attachment sending, client contact verification and public-hosting acceptance remain release checks.
