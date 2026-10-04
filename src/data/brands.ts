import type { Brand } from './types';

export const brands: Brand[] = [
  { name: 'LK', logo: '/images/brands/lk.webp', source: { document: 'business-card' } },
  { name: 'TaeguTec', logo: '/images/brands/taegutec.webp', source: { document: 'business-card' } },
  { name: 'SolidCAM', logo: '/images/brands/solidcam.webp', source: { document: 'business-card' } },
  { name: 'Detron', logo: '/images/brands/detron.webp', source: { document: 'business-card' } },
  { name: 'Air Seiki', logo: '/images/brands/air-seiki.webp', source: { document: 'air-seiki-brochure', pages: [1, 2, 3, 4, 5] } },
  { name: 'VGS & Co', logo: '/images/brands/vgs-co.webp', source: { document: 'business-card' } },
  { name: 'Marposs', logo: '/images/brands/marposs.webp', source: { document: 'business-card' } },
  { name: 'Oilmax', logo: '/images/brands/oilmax.webp', source: { document: 'business-card' } },
  { name: 'DIXI', source: { document: 'catalogue' } },
];
