import { site } from '../config/site.ts';
import type { EnquiryItem } from '../data/types';

export interface Requirement {
  type?: string;
  name?: string;
  company?: string;
  phone?: string;
  email?: string;
  location?: string;
  productCondition?: string;
  quantity?: string;
  quantityUnit?: string;
  usageApplication?: string;
  brand?: string;
  specification?: string;
  machineType?: string;
  machineModel?: string;
  category?: string;
  details?: string;
  preferred?: string;
  attachmentNames?: string[];
}

export function createReference() {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  return (
    'SHK-WEB-' +
    Array.from(bytes, (b) => b.toString(36).padStart(2, '0'))
      .join('')
      .slice(0, 8)
      .toUpperCase()
  );
}

function clean(value?: string) {
  return value?.trim() || '';
}

function detailPairs(r: Requirement, items: EnquiryItem[]) {
  const selected = items.map((item) => item.title).filter(Boolean);
  const product = clean(r.category) || (selected.length === 1 ? selected[0]! : selected.join(' / '));
  const quantity = [clean(r.quantity), clean(r.quantityUnit)].filter(Boolean).join(' ');
  const machine = [clean(r.machineType), clean(r.machineModel)].filter(Boolean).join(' — ');

  return [
    ['Location', clean(r.location)],
    ['Product / Requirement', product],
    ['Product Condition', clean(r.productCondition)],
    ['Quantity', quantity],
    ['Usage / Application', clean(r.usageApplication)],
    ['Brand / Preferred Make', clean(r.brand)],
    ['Size / Model / Specification', clean(r.specification)],
    ['Machine', machine],
  ] as const;
}

export function buildMessage(r: Requirement, items: EnquiryItem[], reference = createReference()) {
  const subject =
    clean(r.category) ||
    (items.length === 1 ? items[0]!.title : items.length > 1 ? 'selected SHK products' : clean(r.type)) ||
    'CNC manufacturing requirement';

  const details = detailPairs(r, items)
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`);

  const selectedItems = items
    .map((item, i) => `${i + 1}. ${item.title}${item.note?.trim() ? ` — ${item.note.trim()}` : ''}`)
    .join('\n');

  const contact = [
    ['Name', clean(r.name)],
    ['Company', clean(r.company)],
    ['Phone / WhatsApp', clean(r.phone)],
    ['Email', clean(r.email)],
    ['Preferred Contact', clean(r.preferred)],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`);

  const sections = [
    'Hi SHK Tech Services,',
    `I would like to enquire for ${subject}.`,
  ];

  if (details.length) sections.push(`Enquiry Details: (${details.join(', ')})`);

  if (clean(r.details)) sections.push(`Requirement / Notes:\n${clean(r.details)}`);

  if (selectedItems && items.length > 1) sections.push(`Selected Items:\n${selectedItems}`);

  if (contact.length) sections.push(contact.join('\n'));

  if (r.attachmentNames?.length) {
    sections.push(
      'Files to share on WhatsApp:\n' +
        r.attachmentNames.join('\n') +
        '\nI will attach these files in this conversation.',
    );
  } else {
    sections.push('I can share a drawing/photo here on WhatsApp if required.');
  }

  sections.push(`Reference: ${reference}`);
  sections.push('Please reply to confirm these details.');

  return sections.join('\n\n');
}

export function whatsappUrl(message: string) {
  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}
