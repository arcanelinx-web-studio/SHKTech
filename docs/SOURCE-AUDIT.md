# Source audit

All 56 pages of **SHK Products & Services.pdf** were read using extracted text and rendered-page review; image-based tables and product pages were visually inspected. All three pages of **SHK Tech Services Homepage.pdf** were reviewed. The supplied HTML was inspected as a bundled visual artifact; none of its runtime or component architecture is used. The business-card image and both SVG logos were inspected. Repeated pasted brief attachments were treated as reference copies, subordinate to the user's explicit request.

## Catalogue map

| Pages | Content used                                                                                                    |
| ----- | --------------------------------------------------------------------------------------------------------------- |
| 1–4   | Organisation description, vision, mission, values; no unsupported partner-status claims                         |
| 5–10  | Detron rotary / tilting tables, tailstocks, hydraulic and pneumatic fixtures, VMC clamps/vices, vacuum clamping |
| 11–14 | Tool holders, pull studs, standards and ATC alignment gauges                                                    |
| 15–16 | DIXI angle heads and custom configuration considerations                                                        |
| 17–20 | Probing, tool setting and tool-breakage sensing                                                                 |
| 21–23 | Laser calibration, ball-bar testing, geometrical alignment and error compensation concept                       |
| 24    | Granite testing plates                                                                                          |
| 25    | Air Seiki mist collection and listed applications                                                               |
| 26    | SolidCAM milling, turning and multi-axis capabilities                                                           |
| 27–38 | Turning workholding, mandrels, collets, indexing/lever chucks and applications                                  |
| 39–40 | VGS & Co conveyors and coolant/oil filtration                                                                   |
| 41–50 | Oilmax compaction, sump cleaning, tramp oil separation, applications and specifications                         |
| 51–54 | Reconditioning, subsystem retrofit, spindle cartridges, ball screws, guides, measuring/test equipment           |
| 55    | Twelve manufacturing/application environments; no customer logos or names reproduced                            |
| 56    | Alternate contact details, recorded below but not used publicly                                                 |

Ultrasonic cleaning and the additional technology names are supported by the business card. It does not establish detailed machine specifications or relationship status.

## Exact page 43 transcription

| Parameter                    | VCC 12-110         | VCC 10-150         |
| ---------------------------- | ------------------ | ------------------ |
| Briquette size               | Ø100 mm × 50 mm    | Ø75 mm × 50 mm     |
| Hydraulic force              | 110 T              | 150 T              |
| Electric motor               | 15 HP              | 15 HP              |
| Cycle time                   | 25 Sec             | 30 Sec             |
| Machine size (L × W × H), mm | 1700 × 1900 × 2350 | 1700 × 2000 × 2350 |

Web presentation normalizes spacing and `Sec` to `s` without changing values. Model currency and application suitability still require confirmation.

## Business facts requiring confirmation

- The business card lists the Peenya address and `shktechservices@gmail.com`. Catalogue page 56 instead lists 226, Radiant Enclave, Suncity Road, K S Town, Bengaluru – 560060, and `Sales.shktech@gmail.com`. The card's information is the selected provisional source in `src/config/site.ts`.
- Confirm that the listed phone is actively monitored for business WhatsApp enquiries.
- Confirm the final production domain. `SITE_URL` is a deployment setting; the fallback origin is not verified ownership.
- Confirm current model availability, compatibility, technical details and the downloadable documents approved for publication.
- Confirm rights to publish manufacturer catalogue photographs and technology names on the public site.
- Review the operational wording of service scope, verification and commissioning: the site describes a discussion process, not a guarantee or a measured outcome.

## Deliberate limitations

- Technology names are text, not invented manufacturer artwork. No authorised distributor/partner claim appears.
- The circularity plot is synthetic and explicitly labelled illustrative. It has no dimensional scale or customer performance claim.
- Industry/application pairings are navigational suggestions, not customer relationships or regulatory qualifications.
- No customer claims, testimonials, counts, founding year, guarantees, prices, ratings, certifications or unsupported geography.
- Mission text conveys intent rather than promising delivery lead times.
- No published ultrasonics specification or fabricated product photograph.
- The static category pages use accurate collection content. Product schema is omitted because these are categories, not individual model offers.

## Asset provenance and replacement priority

| Asset             | Source             | Native resolution / action                                     |
| ----------------- | ------------------ | -------------------------------------------------------------- |
| Both logos        | Supplied SVG files | Preserved byte-for-byte; no replacement needed                 |
| Hero/probing      | Catalogue p17      | 997 × 712; obtain original before larger hero usage            |
| Rotary table      | p5                 | 335 × 216; high-priority original replacement                  |
| Fixtures          | p7                 | 630 × 245; original photos preferred                           |
| Tool holders      | p11                | 720 × 371; original cutouts preferred                          |
| Angle head        | p15                | 320 × 304; high-priority original replacement                  |
| Mandrels/chucks   | p34                | 728 × 565; manufacturer-approved originals preferred           |
| Conveyor          | p39                | 328 × 373; high-priority original replacement                  |
| Coolant systems   | p44                | 719 × 389; obtain clean product image without slide text       |
| Compactor         | p41 crop           | Rendered crop of source; obtain an original machine photograph |
| Mist collector    | p25                | 811 × 570; obtain clean standalone artwork                     |
| Granite equipment | p24 crop           | Rendered crop; obtain individual product images                |
| CAM               | p26                | 300 × 168; replace with approved higher-resolution screenshot  |
| Sump comparison   | p50                | 662 × 340; original comparison images preferred                |

No stock/manufacturer images were sourced externally. Catalogue imagery stays in bounded product/technical frames. Astro produces smaller responsive WebP variants rather than enlarging source images.
