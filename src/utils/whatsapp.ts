import { site } from '../config/site.ts';
import type { EnquiryItem } from '../data/types';
export interface Requirement {
  type?: string;
  name?: string;
  company?: string;
  phone?: string;
  email?: string;
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
export function buildMessage(r: Requirement, items: EnquiryItem[], reference = createReference()) {
  const lines = (pairs: [string, string | undefined][]) =>
    pairs.filter(([, v]) => v?.trim()).map(([label, value]) => `${label}: ${value!.trim()}`);
  const sections = [
    'Hello SHK Tech Services,',
    'I would like to discuss the following requirement.',
    `REF: ${reference}`,
  ];
  const machine = lines([
    ['Type', r.machineType],
    ['Make / Model', r.machineModel],
  ]);
  if (machine.length) sections.push('MACHINE\n' + machine.join('\n'));
  const requirement = lines([
    ['Type', r.type],
    ['Category', r.category],
    ['Details', r.details],
  ]);
  if (requirement.length) sections.push('REQUIREMENT\n' + requirement.join('\n'));
  if (items.length)
    sections.push(
      'SELECTED ITEMS\n' +
        items
          .map(
            (item, i) =>
              `${i + 1}. ${item.title}${item.note?.trim() ? ` — ${item.note.trim()}` : ''}`,
          )
          .join('\n'),
    );
  const contact = lines([
    ['Name', r.name],
    ['Company', r.company],
    ['Phone', r.phone],
    ['Email', r.email],
    ['Preferred contact', r.preferred],
  ]);
  if (contact.length) sections.push('CONTACT\n' + contact.join('\n'));
  if (r.attachmentNames?.length)
    sections.push(
      'FILES TO SHARE IN WHATSAPP\n' +
        r.attachmentNames.join('\n') +
        '\nI will attach these files in this conversation.',
    );
  else sections.push('I can share a drawing/photo here on WhatsApp.');
  return sections.join('\n\n');
}
export function whatsappUrl(message: string) {
  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}
