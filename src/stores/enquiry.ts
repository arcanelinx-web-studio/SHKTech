import type { EnquiryItem } from '../data/types';
export const STORAGE_KEY = 'shk-enquiry-v1';
export function parseItems(raw: string | null): EnquiryItem[] {
  try {
    const items: unknown = JSON.parse(raw || '[]');
    if (!Array.isArray(items)) return [];
    const seen = new Set<string>();
    return items
      .filter((v): v is EnquiryItem => {
        if (
          !v ||
          typeof v !== 'object' ||
          typeof v.id !== 'string' ||
          typeof v.title !== 'string' ||
          !['product', 'category', 'service'].includes(v.kind) ||
          seen.has(v.id)
        )
          return false;
        seen.add(v.id);
        return true;
      })
      .slice(0, 100)
      .map((v) => ({ ...v, note: typeof v.note === 'string' ? v.note.slice(0, 1000) : '' }));
  } catch {
    return [];
  }
}
let memory: EnquiryItem[] = [];
let storageAvailable = true;
export function getItems() {
  if (typeof window === 'undefined') return [...memory];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (storageAvailable) memory = parseItems(raw);
  } catch {
    storageAvailable = false;
  }
  return [...memory];
}
export function setItems(items: EnquiryItem[]) {
  memory = items;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  if (typeof window !== 'undefined')
    window.dispatchEvent(new CustomEvent('shk:enquiry', { detail: items }));
  return storageAvailable;
}
export function addItem(item: EnquiryItem) {
  const current = getItems();
  if (current.some((i) => i.id === item.id)) return false;
  setItems([...current, item]);
  return true;
}
export function removeItem(id: string) {
  setItems(getItems().filter((i) => i.id !== id));
}
export function notify(message: string) {
  const el = document.querySelector<HTMLElement>('#announcement');
  if (el) {
    el.textContent = message;
    el.classList.add('visible');
    window.setTimeout(() => el.classList.remove('visible'), 4000);
  }
}
function refresh() {
  const items = getItems();
  document.querySelectorAll<HTMLElement>('[data-enquiry-count]').forEach((el) => {
    el.textContent = String(items.length);
    el.hidden = items.length === 0;
  });
  document.querySelectorAll<HTMLButtonElement>('[data-add-enquiry]').forEach((button) => {
    const selected = items.some((i) => i.id === button.dataset.id);
    button.setAttribute('aria-pressed', String(selected));
    button.querySelector('span')!.textContent = selected ? 'In Enquiry' : 'Add to Enquiry';
    button.setAttribute(
      'aria-label',
      `${selected ? 'Already in enquiry:' : 'Add to enquiry:'} ${button.dataset.title}`,
    );
  });
  document
    .querySelectorAll<HTMLElement>('[data-selected-summary]')
    .forEach(
      (el) =>
        (el.textContent = items.length
          ? items.map((i) => i.title).join(' · ')
          : 'No items selected. You can describe your requirement below.'),
    );
}
if (typeof window !== 'undefined') {
  document.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-add-enquiry]');
    if (button) {
      const added = addItem({
        id: button.dataset.id!,
        title: button.dataset.title!,
        kind: button.dataset.kind as EnquiryItem['kind'],
      });
      notify(
        added
          ? storageAvailable
            ? 'Added to your enquiry list.'
            : 'Added for this visit. Browser storage is unavailable; keep this page open.'
          : 'This item is already in your enquiry list.',
      );
    }
  });
  window.addEventListener('shk:enquiry', refresh);
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      memory = parseItems(event.newValue);
      window.dispatchEvent(new CustomEvent('shk:enquiry'));
    }
  });
  refresh();
}
