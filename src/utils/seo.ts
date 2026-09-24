import { site } from '../config/site';
export const organization = (origin: string) => ({
  '@context': 'https://schema.org',
  '@type': ['Organization', 'LocalBusiness'],
  '@id': `${origin}/#organization`,
  name: site.name,
  url: origin,
  logo: `${origin}/images/logos/SHK-logo.svg`,
  description: site.description,
  telephone: site.contact.phone,
  email: site.contact.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: site.contact.address,
    addressLocality: site.contact.locality,
    addressRegion: site.contact.region,
    postalCode: site.contact.postalCode,
    addressCountry: site.contact.country,
  },
});
export const breadcrumbs = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: item.url,
  })),
});
