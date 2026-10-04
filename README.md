# SHK Tech Services

Static-first Astro / TypeScript / Tailwind website for SHK Tech Services, Bengaluru. The production target for this review branch is **Hostinger**, not Cloudflare.

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

The Astro build is static. PHP files placed under `public/api/` are copied unchanged to `dist/api/` and run only after the `dist` contents are deployed to Hostinger.

## Architecture

- `src/`: public Astro website and browser interactions.
- `public/downloads/`: client-approved SHK company profile and catalogues.
- `public/api/`: Hostinger PHP API for enquiries, attachments and the admin lead desk.
- `deployment/hostinger/schema.sql`: MariaDB / MySQL lead database schema.
- `deployment/hostinger/config.sample.php`: private server configuration template.
- `src/pages/admin.astro`: protected SHK lead desk interface.
- `tests/`: type, unit, build, browser and accessibility checks.

The public website remains static and lightweight. The CRM functions use PHP plus Hostinger's MySQL/MariaDB service. Customer drawings are stored outside the public web root when the private directory is configured. Email catalogue delivery uses SMTP. Optional automatic WhatsApp acknowledgement uses the Meta WhatsApp Business Platform and requires an approved template and customer opt-in.

## Catalogue delivery

The final PDFs in `public/downloads/` are now the same files used by:

- each product page's **View catalogue** action;
- the Machine Services pages;
- the company profile download;
- the post-enquiry catalogue result;
- automatic catalogue email;
- optional WhatsApp acknowledgement.

A general enquiry falls back to the SHK company profile.

## Hostinger deployment

Build the website with the final domain:

```powershell
$env:SITE_URL="https://YOUR-FINAL-DOMAIN"
npm run build
```

Upload the **contents of `dist/`** into the Hostinger website's `public_html` directory.

Create a Hostinger MySQL database and import `deployment/hostinger/schema.sql`. Copy `deployment/hostinger/config.sample.php` to a private directory beside `public_html`, normally:

```text
.../domains/YOUR-DOMAIN/shk-private/config.php
```

Fill in the database, admin and SMTP credentials in that private file. Real credentials must never be committed to GitHub.

See `docs/LEAD-DESK-SETUP.md` for the complete production checklist.

## Review / rollback

Hostinger adaptation branch:

`client-review-v4-hostinger-crm`

Previous CRM experiment:

`client-review-v3-shk-crm`

Approved pre-CRM design rollback point:

`design-refinement-v2`

Do not merge into main until the client review is complete.

## Source policy

See `docs/SOURCE-AUDIT.md` for content provenance and remaining client confirmations. Do not introduce authorised-partner claims, customer proof, measurable outcomes or model compatibility without supporting material.
