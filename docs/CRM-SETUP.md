# SHK Enquiry Desk — production setup

The public website remains a static Astro site. Cloudflare Pages Functions provide the enquiry API and admin authentication, while Cloudflare D1 stores enquiry and follow-up data.

## Production bindings

Create a D1 database named `shk-enquiries` and apply `database/schema.sql`.

Bind it to the Pages project as:

- Variable name: `DB`
- D1 database: `shk-enquiries`

Configure encrypted Pages secrets:

- `ADMIN_USERNAME` — optional; defaults to `shkadmin`
- `ADMIN_PASSWORD` — strong SHK-only password
- `SESSION_SECRET` — long random secret used to sign the 12-hour admin session

Never commit these values.

## Behaviour

- Public form POSTs to `/api/enquiries` before opening WhatsApp.
- A successful submission is stored with the same SHK reference shown in WhatsApp.
- `/admin/login/` creates an HttpOnly, Secure, SameSite=Strict session cookie.
- `/admin/` fetches protected enquiries, supports stage/priority/owner/follow-up updates and exports CSV.
- GitHub Pages cannot run Cloudflare Functions. On the review preview only, the admin interface uses clearly marked sample/local review data so the client can evaluate the workflow.
- Drawings/photos are still attached by the customer in WhatsApp. They are not uploaded to D1.

## Rollback

All CRM/client-logo work is isolated on branch `client-crm-admin-v1`. The prior website remains on `design-refinement-v2`.
