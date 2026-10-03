export interface Catalogue {
  id: string;
  productId: string;
  brand: string;
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  applications: string[];
  table?: {
    caption: string;
    headers: string[];
    rows: string[][];
  };
  compatibility: string;
}

export const catalogues: Catalogue[] = [
  {
    id: 'oilmax-sump-cleaner',
    productId: 'coolant-filtration',
    brand: 'Oilmax',
    eyebrow: 'COOLANT / SUMP CLEANING',
    title: 'Coolant / Sump Cleaning System',
    description:
      'Oilmax sump-cleaning systems use vacuum suction to remove coolant, metal chips and swarf from the machine tank, retain contamination in a reusable stainless-steel mesh basket and return cleaned coolant to the machine.',
    highlights: [
      'No filter element to replace',
      'No recurring filter-element cost',
      'Very fine dirt removal from coolant down to 10 µm',
      'Reduced coolant consumption',
      'Extended coolant change period',
      'Reduced machine downtime',
      'Improved product finish',
    ],
    applications: [
      'CNC / VMC chips',
      'Grinding',
      'Glass grinding',
      'Polymer quenching',
      'Chip suction',
      'Oil suction',
      'Centralized coolant tanks',
      'Water filtration',
    ],
    table: {
      caption: 'Oilmax Coolant / Sump Cleaner - model selection',
      headers: ['Parameter', 'SC 50', 'SC 200', 'SC 300', 'SC 400', 'SC 500'],
      rows: [
        ['Tank capacity (L)', '50', '200', '300', '400', '500'],
        ['Basket capacity (L)', '10', '18', '25', '25', '25'],
        ['Max. vacuum (mm Hg)', '180', '200', '300', '300', '300'],
        ['Vacuum pump motor (HP)', '1', '3', '5', '5', '5'],
        [
          'Dimensions (L × W × H)',
          '34″ × 25″ × 48″',
          '60″ × 25″ × 40″',
          '70″ × 30″ × 50″',
          '82″ × 30″ × 50″',
          '98″ × 30″ × 50″',
        ],
      ],
    },
    compatibility:
      'Share sump capacity, contamination type, machine layout and suction requirement with SHK to confirm a suitable model.',
  },
  {
    id: 'air-seiki-mist-collectors',
    productId: 'mist-collectors',
    brand: 'Air Seiki',
    eyebrow: 'INDUSTRIAL MIST FILTRATION',
    title: 'Air Seiki Industrial Mist Filtration Systems',
    description:
      'Air Seiki mist collectors are intended for industrial machine-tool applications where oil or emulsion mist needs to be captured at source.',
    highlights: [
      'AS AIR5, AIR10, AIR15 and AIR20 MIST models',
      '99% filtration efficiency stated in the supplied brochure',
      'Suitable for oil and emulsion mist',
      'Compact construction',
      'Mist removal at source',
      'Three-stage filter cassette arrangement',
    ],
    applications: [
      'Turning centres',
      'Machining centres',
      'Surface grinding',
      'Cylindrical grinding',
      'Industrial saws',
      'Electro discharge machining',
      'Parts washing',
      'Food processing',
    ],
    table: {
      caption: 'Air Seiki MIST series - technical data',
      headers: [
        'Model',
        'Air flow (CMH)',
        'Voltage (V)',
        'Current (A)',
        'Input power (W)',
        'Speed (RPM)',
        'Noise (dB)',
      ],
      rows: [
        ['AS AIR5 MIST', '600', '230', '0.42', '100', '2480', '70'],
        ['AS AIR10 MIST', '1100', '230', '0.81', '190', '2450', '71'],
        ['AS AIR15 MIST', '1500', '230', '1.05', '240', '2480', '79'],
        ['AS AIR20 MIST', '2000', '230', '1.20', '260', '1350', '64'],
      ],
    },
    compatibility:
      'Share required air flow, machine enclosure, mist loading and mounting arrangement with SHK before selection.',
  },
];

export const getCatalogue = (id: string) => catalogues.find((catalogue) => catalogue.id === id);
