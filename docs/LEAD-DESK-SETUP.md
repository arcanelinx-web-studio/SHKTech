# SHK lead desk, catalogue delivery and deployment setup

This review branch keeps the public SHK website design intact and adds an internal lead-management layer.

## Public enquiry flow

1. Visitor selects one or more SHK product categories or services.
2. Visitor submits the existing requirement form.
3. The enquiry is stored in Cloudflare D1 with reference, contact details, product/application details and selected items.
4. Up to five supported attachments can be stored privately in an R2 bucket bound as `FILES`.
5. The relevant catalogue URL is selected from the category mapping.
6. The customer sees the catalogue immediately after submission.
7. If email delivery is configured, the customer receives the catalogue link by transactional email.
8. SHK receives an internal enquiry email.
9. If WhatsApp Business Platform credentials and an approved template are configured, an acknowledgement can also be sent on WhatsApp.
10. The visitor can still continue the enquiry in WhatsApp using the structured message already used by the site.

## Admin access

A discreet **SHK Admin** link is in the footer.

The admin page is `/admin/`. The page itself contains no customer data until a valid server-side session is established. Credentials are environment secrets, never hard-coded into the site.

Lead stages:
- New
- Contacted
- Qualified
- Quotation
- Follow-up
- Won
- Lost

The dashboard includes search, stage filtering, catalogue-delivery status, internal notes and protected attachment downloads.

## Cloudflare bindings

Create and bind:

- D1 database binding: `DB`
- R2 bucket binding: `FILES`

Apply `migrations/0001_leads.sql` to the D1 database.

Configure secrets/variables from `.env.example` in Cloudflare. Never commit real passwords, API keys or Meta tokens.

## Email delivery

The Functions integration uses Resend's HTTPS API. Configure:
- `RESEND_API_KEY`
- `ENQUIRY_FROM_EMAIL` from a verified sending domain
- `SHK_ALERT_EMAIL`

If these values are absent, the lead is still stored and the catalogue is still shown in the browser; email delivery is reported as not configured.

## WhatsApp Business acknowledgement

Automatic business-to-customer WhatsApp messages require Meta WhatsApp Business Platform credentials and an approved template.

Expected environment values:
- `WHATSAPP_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_TEMPLATE_NAME`
- `WHATSAPP_TEMPLATE_LANGUAGE`

Recommended template body:

```
Hi {{1}}, thank you for your enquiry with SHK Tech Services.
Reference: {{2}}
Your relevant catalogue: {{3}}

Our engineering team will review your requirement and follow up.
Responsible Engineering.
```

The customer must select the WhatsApp opt-in checkbox before this automatic template is attempted.

## Catalogue files expected by the website

Put the final client-approved PDFs in `public/downloads/` using exactly these filenames:

| Website category | Required filename |
| --- | --- |
| Chip conveyors | `chip-conveyors.pdf` |
| Coolant, sump cleaning & filtration | `coolant-sump-cleaning-filtration.pdf` |
| Chip compactors | `chip-compactors.pdf` |
| Oil mist collection | `oil-mist-collection.pdf` |
| Rotary & tilting tables | `rotary-tilting-tables.pdf` |
| Fixtures & clamping | `fixtures-clamping.pdf` |
| Tool holders & pull studs | `tool-holders-pull-studs.pdf` |
| Custom angle heads | `custom-angle-heads.pdf` |
| Probing & tool breakage | `probing-tool-breakage.pdf` |
| Mandrels & chucks | `mandrels-chucks.pdf` |
| Measuring & test equipment | `measuring-test-equipment.pdf` |
| CAM / programming | `cam-programming.pdf` |
| Ultrasonic cleaning | `ultrasonic-cleaning.pdf` |
| Company profile | `shk-tech-services-company-profile.pdf` |
| Complete portfolio / general enquiry fallback | `shk-products-services-current.pdf` |

Once these exact files exist, all product-page catalogue buttons and automated catalogue-delivery links use the same source files. No additional code mapping is required.

## Attachment policy

Allowed extensions:
- PDF
- JPG / JPEG
- PNG
- WEBP
- DWG
- DXF
- STEP / STP

Limits:
- maximum 5 files from the current form
- maximum 15 MB per file

R2 objects remain private. The public site does not expose R2 URLs. Admin downloads go through the authenticated `/api/admin/file` endpoint.

## Rollback

All work in this feature pass lives on:

`client-review-v3-shk-crm`

The approved `design-refinement-v2` branch remains untouched and is the rollback point.
