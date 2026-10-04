# SHK Hostinger lead desk and catalogue delivery

This branch keeps the approved public website design and moves the enquiry / CRM layer to Hostinger-compatible PHP + MySQL.

## What the customer experiences

1. The visitor selects a product, service or enquiry-list item.
2. The existing requirement form captures contact, application, quantity, machine and specification details.
3. Up to five supported drawings/photos/documents can be stored privately with the enquiry.
4. The enquiry receives an SHK reference and is saved in the Hostinger MySQL/MariaDB database.
5. The matching SHK catalogue is shown immediately after submission.
6. If an email address is supplied and SMTP is configured, the customer also receives the catalogue link by email.
7. SHK receives an internal enquiry email.
8. The visitor can continue in WhatsApp with the structured requirement message.
9. If SHK later configures the Meta WhatsApp Business Platform and an approved template, an opted-in customer can also receive the acknowledgement/catalogue link automatically on WhatsApp.

## SHK Admin

The footer contains a discreet **SHK Admin** link to `/admin/`.

Lead stages:

- New
- Contacted
- Qualified
- Quotation
- Follow-up
- Won
- Lost

The dashboard supports search, stage filtering, internal notes, delivery status and protected attachment downloads.

## Hostinger setup

### 1. Build the website

Use the final production origin when building:

```bash
SITE_URL=https://YOUR-FINAL-DOMAIN npm run build
```

Upload the contents of `dist/` to the website's Hostinger `public_html` directory.

### 2. Create the database

In Hostinger hPanel create one MySQL database and database user.

Import:

`deployment/hostinger/schema.sql`

through phpMyAdmin.

### 3. Create the private configuration

Copy:

`deployment/hostinger/config.sample.php`

to a directory **outside** `public_html`, ideally:

`.../domains/YOUR-DOMAIN/shk-private/config.php`

Fill in:

- production domain;
- Hostinger database name/user/password;
- SHK admin username and password hash;
- Hostinger mailbox SMTP credentials;
- SHK internal alert email;
- optional Meta WhatsApp Business credentials.

The PHP API automatically looks for the private configuration beside `public_html`.

### 4. SMTP

For Hostinger Email the recommended defaults in the sample are:

- host: `smtp.hostinger.com`
- SSL port: `465`

Use a real mailbox on the final domain as the sender. The mailbox password remains only in the private server configuration.

### 5. Attachments

Supported:

- PDF
- JPG / JPEG
- PNG
- WEBP
- DWG
- DXF
- STEP / STP

Limits:

- maximum five files from the form;
- maximum 15 MB each.

They are stored below the private `shk-private/uploads/` directory, not inside the public website. Admin downloads are served through an authenticated PHP endpoint.

## Final catalogue mapping

| Website area | File |
| --- | --- |
| Rotary & tilting tables | `SHK-Catalogue-01-Rotary-Tilting-Tables.pdf` |
| Fixtures & clamping | `SHK-Catalogue-02-Fixtures-Clamping.pdf` |
| Tool holders & pull studs | `SHK-Catalogue-03-Tool-Holders-Pull-Studs.pdf` |
| Custom angle heads | `SHK-Catalogue-04-Custom-Angle-Heads.pdf` |
| Probing & tool breakage | `SHK-Catalogue-05-Probing-Tool-Breakage.pdf` |
| Mandrels & chucks | `SHK-Catalogue-06-Mandrels-Chucks.pdf` |
| Chip conveyors | `SHK-Catalogue-07-Chip-Conveyors.pdf` |
| Coolant / sump cleaning / filtration | `SHK-Catalogue-08-Coolant-Sump-Cleaning-Filtration.pdf` |
| Chip compactors | `SHK-Catalogue-09-Chip-Compactors.pdf` |
| Oil mist collection | `SHK-Catalogue-10-Oil-Mist-Collection.pdf` |
| Measuring & test equipment | `SHK-Catalogue-11-Measuring-Test-Equipment.pdf` |
| CAM / programming | `SHK-Catalogue-12-CAM-Programming.pdf` |
| Ultrasonic cleaning | `SHK-Catalogue-13-Ultrasonic-Cleaning.pdf` |
| Machine services | `SHK-Catalogue-14-Machine-Services.pdf` |
| Company profile / general fallback | `SHK-Tech-Services-Company-Profile.pdf` |

## WhatsApp Business acknowledgement

The automatic outbound message is optional because Meta requires an approved WhatsApp Business template. The integration expects three template variables:

```text
Hi {{1}}, thank you for your enquiry with SHK Tech Services.
Reference: {{2}}
Your relevant catalogue: {{3}}

Our engineering team will review your requirement and follow up.
Responsible Engineering.
```

Variables are customer name, SHK reference and catalogue URL.

## Important final-domain check

The current generated catalogue PDFs contain the temporary GitHub Pages address in their contact page. Before final client handover, regenerate or edit the PDFs to show the client's final Hostinger domain (or remove the website URL if the domain is not yet confirmed).

## Rollback

Current Hostinger branch:

`client-review-v4-hostinger-crm`

Previous branch:

`client-review-v3-shk-crm`

Approved design rollback:

`design-refinement-v2`
