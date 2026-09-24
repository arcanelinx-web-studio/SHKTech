import type { Brand } from './types';
export const brands: Brand[] = [
  'Detron',
  'TaeguTec',
  'SolidCAM',
  'Marposs',
  'Oilmax',
  'Air Seiki',
  'VGS & Co',
  'DIXI',
].map((name) => ({ name, source: { document: name === 'DIXI' ? 'catalogue' : 'business-card' } }));
