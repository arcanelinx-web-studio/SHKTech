# SHK Enquiry CRM setup

This branch adds a private enquiry/lead workspace without changing the public SHK site's visual direction.

## Cloudflare bindings

Create a D1 database for the site and bind it to the Pages project as:

- Binding name: `DB`

Apply `migrations/0001_shk_crm.sql` to that database.

Add encrypted environment variables in the Cloudflare Pages project:

- `ADMIN_EMAIL` — SHK's admin login email
- `ADMIN_PASSWORD` — a unique strong password
- `SESSION_SECRET` — a long random secret used to sign the admin session cookie

Do not commit any of these values.

## What is stored

When a visitor submits the requirement form, the site attempts to create a CRM enquiry before opening WhatsApp. If the API/database is unavailable, WhatsApp still works; the public enquiry flow does not become dependent on the CRM.

Stored fields include contact information, product/application details, selected enquiry-list items, machine context, source, status, priority, follow-up date and internal activity notes.

No uploaded drawing/photo bytes are stored in this version. The existing privacy-preserving behaviour remains: files stay on the visitor's device and are attached manually in WhatsApp.

## Admin routes

- `/admin/login/` — SHK staff sign-in
- `/admin/` — lead dashboard and pipeline

The admin link is intentionally discreet in the footer. Admin pages are noindex.

## Pipeline

New → Contacted → Qualified → Quotation → Follow-up → Won / Lost

The admin can also set priority, follow-up date, owner, and append call/WhatsApp/email/meeting/internal notes.

## Rollback

All CRM work is isolated on `client-crm-preview-v1`. The existing `design-refinement-v2` branch is unchanged.
