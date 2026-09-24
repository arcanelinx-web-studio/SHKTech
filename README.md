# SHK Tech Services

Static-first Astro / TypeScript / Tailwind website for SHK Tech Services, Bengaluru. Developed on `astra-foundation-v1`; do not merge into main without review.

## Local development

Requires Node.js 22.12+ (Node 24 LTS recommended) and npm.

```powershell
npm install
npm run dev
```

Open http://127.0.0.1:4321.

```powershell
npm run check
npm test
npm run build
npm run preview
```

Browser regression checks require installed Google Chrome and a running site:

```powershell
npm run test:browser
```

Set `BASE_URL` to test another local port. Set `REVIEW_DIR` to a file URL or path relative to `tests/browser.mjs` to choose the screenshot/report output directory. In this workspace the default writes to the task's `outputs/review` folder. Tests do not send a WhatsApp message: they intercept the generated link.

For restricted Codex shells, use `npm install --cache ../npm-cache` and set `$env:ASTRO_TELEMETRY_DISABLED='1'` before Astro commands. These are environment workarounds, not application requirements.

## Architecture

- `src/config/site.ts`: all company/contact information. Business-card details are provisional.
- `src/data/`: typed catalogue categories, services, brands, industries, problems and machine zones with source provenance.
- `src/components/`: global, navigation, home, products, enquiry and machine explorer components.
- `src/layouts/BaseLayout.astro`: metadata, structured data, shared shell and fonts.
- `src/pages/`: pre-rendered category, service and problem routes, homepage, about, privacy, enquiry and 404.
- `src/stores/enquiry.ts`: validated, deduplicated localStorage list with cross-tab updates and blocked-storage fallback.
- `src/utils/whatsapp.ts`: pure message formatting, URL encoding and random reference generation.
- `src/assets/`: extracted catalogue images; Astro generates responsive WebP assets.
- `public/images/logos/`: exact, unmodified supplied SVG artwork.
- `tests/`: message/storage unit checks and browser workflows, responsive screenshots and axe audits.

React is deliberately absent: the interactions use small TypeScript modules and native HTML. There is no client routing framework, backend, analytics, upload service or customer data database.

## Content expansion

Add verified records to `products.ts` or `services.ts`; route generation is automatic. The product template supports applications, features, specifications, compatibility, downloads and related categories. The `Product` interface extends category fields for a later model-level catalogue. Add model-level routes once their source content is available.

Do not publish an unrelated image for a category without a verified image. Ultrasonic cleaning is supported by the business card but has no identified product photo/specification; its card intentionally uses a text treatment.

## WhatsApp and privacy

The visitor reviews the message in WhatsApp and sends it themselves. Selected files stay on the device; their filenames can appear in the message, but the files must be attached manually. Contact form fields are not persisted. The enquiry list and optional notes stay in localStorage until cleared.

## Cloudflare Pages / static hosting

1. Confirm the company contacts and final domain before public release.
2. Connect the repository and select the reviewed deployment branch.
3. Build command: `npm run build`. Output directory: `dist`. Set Node 24 and `SITE_URL` to the confirmed HTTPS origin.
4. `public/_headers` adds basic security and immutable asset-cache headers on Cloudflare Pages and Netlify.
5. Verify canonical URLs, sitemap, WhatsApp destination, phone/email and the native mobile WhatsApp flow on the deployed site.

The fallback `https://shktech.pages.dev` is a provisional build origin, not a claim that SHK owns that address or that the site is deployed. No public deployment was performed in this task. `.env.example` documents the required origin setting; use an environment variable in the build process.

## Source policy

See `docs/SOURCE-AUDIT.md` for page references, confirmed specification transcription, contact conflict and remaining client confirmations. Do not introduce authorised-partner claims, customer proof, measurable outcomes or model compatibility without new evidence.
