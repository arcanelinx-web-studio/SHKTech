import type { ProductCategory } from './types';
import rotary from '../assets/rotary.webp';
import fixtures from '../assets/fixtures.webp';
import holders from '../assets/holders.webp';
import angle from '../assets/angle.webp';
import probe from '../assets/probe.webp';
import mandrels from '../assets/mandrels.webp';
import conveyor from '../assets/conveyor.webp';
import coolant from '../assets/coolant.webp';
import compactor from '../assets/compactor.webp';
import mist from '../assets/mist.webp';
import granite from '../assets/granite.webp';
import cam from '../assets/cam.webp';
export const products: ProductCategory[] = [
  {
    id: 'rotary-tables',
    title: 'Rotary & tilting tables',
    label: 'ROTARY AXES',
    description:
      'Access more faces of the part with rotary tables, tilting tables and support tailstocks.',
    image: rotary,
    features: ['CNC rotary tables', 'CNC tilting rotary tables', 'Support rotary tailstocks'],
    applications: ['Multi-face machining', 'VMC workholding'],
    source: { document: 'catalogue', pages: [5, 6, 9] },
  },
  {
    id: 'fixtures-clamping',
    title: 'Fixtures & clamping',
    label: 'HYDRAULIC · PNEUMATIC',
    description:
      'Build the setup around the part, with dedicated fixtures, vices and vacuum clamping.',
    image: fixtures,
    features: [
      'Hydraulic and pneumatic fixtures',
      'VMC vices and fixture clamps',
      'Vacuum clamping systems',
    ],
    applications: ['Machining centres', 'Repeat component setups'],
    source: { document: 'catalogue', pages: [7, 8, 10, 29] },
  },
  {
    id: 'tool-holders',
    title: 'Tool holders & pull studs',
    label: 'SPINDLE INTERFACE',
    description: 'Tool holding and retention components selected for your machine interface.',
    image: holders,
    features: [
      'Tool holders',
      'Pull studs with or without coolant and O-rings',
      'ATC alignment gauges: BT / BBT / HSK',
    ],
    applications: ['Machining centres', 'Tool change alignment'],
    specifications: { 'Pull stud standards': 'MAS 403 BT (DIN ISO 7388-3); DIN 69872 A with TC' },
    compatibility:
      'Pull studs shown for MAS, DIN, ISO, Mazak, Brother, Doosan and Haas. Confirm the exact interface before selection.',
    source: { document: 'catalogue', pages: [11, 12, 13, 14] },
  },
  {
    id: 'angle-heads',
    title: 'Custom angle heads',
    label: 'REACH · ORIENTATION',
    description: 'Reach a different face or angle with a head configured around the application.',
    image: angle,
    features: [
      'Custom-built angle heads',
      'Drive and output spindle taper selection',
      'Machine mounting and coolant configuration',
    ],
    applications: ['Angular machining', 'Features with restricted tool access'],
    source: { document: 'catalogue', pages: [15, 16] },
  },
  {
    id: 'probing',
    title: 'Probing & tool breakage',
    label: 'TURNING · MACHINING',
    description: 'Touch probes, tool setting and breakage sensing for the machining cycle.',
    image: probe,
    features: [
      'Touch probes for turning and machining centres',
      'Tool breakage sensors',
      'Tool setting solutions',
    ],
    applications: ['Part location', 'Tool monitoring'],
    source: { document: 'catalogue', pages: [17, 18, 19, 20] },
  },
  {
    id: 'mandrels-chucks',
    title: 'Mandrels & chucks',
    label: 'PRECISION WORKHOLDING',
    description: 'Hold bores, gears and shaped components with application-specific workholding.',
    image: mandrels,
    features: [
      'Hydraulic oil and jelly mandrels',
      'Grinding, hobbing and balancing mandrels',
      'Indexing, lever and collet chucks',
    ],
    applications: ['Gear machining', 'Grinding', 'Valve bodies and fittings'],
    source: { document: 'catalogue', pages: [28, 30, 31, 32, 33, 34, 35, 36, 37, 38] },
  },
  {
    id: 'chip-conveyors',
    title: 'Chip conveyors',
    label: 'CHIP HANDLING',
    description: 'Move swarf away from the cut with a conveyor matched to the chip and machine.',
    image: conveyor,
    features: [
      'Hinged belt, magnetic and screw conveyors',
      'Wiper conveyors with drum filter options',
      'Spiral and centralized conveyors',
    ],
    applications: ['Turning and machining centres', 'Central chip handling'],
    source: { document: 'catalogue', pages: [39, 40] },
  },
  {
    id: 'coolant-filtration',
    title: 'Coolant & filtration',
    label: 'SUMP · OIL · FILTERS',
    description: 'Sump cleaning, tramp oil separation and filtration for machine fluids.',
    image: coolant,
    features: [
      'Coolant / sump cleaning systems',
      'Tramp oil separators',
      'Magnetic, paper-band, hydrocyclone and centrifugal filtration',
    ],
    applications: ['Machine sumps', 'Centralized coolant tanks'],
    source: { document: 'catalogue', pages: [40, 44, 45, 48, 50] },
  },
  {
    id: 'chip-compactors',
    title: 'Chip compactors',
    label: 'VCC SERIES',
    description: 'Compact machining swarf and grinding dust into more manageable material.',
    image: compactor,
    features: [
      'Chip and grinding dust compaction',
      'Scrap / swarf compaction',
      'VCC 12-110 and VCC 10-150 models',
    ],
    applications: [
      'Aluminium, MS and casting burr',
      'Brass, copper and SS burr',
      'Hobbing / broaching burr and grinding dust',
    ],
    source: { document: 'catalogue', pages: [41, 42, 43, 46, 47, 49] },
  },
  {
    id: 'mist-collectors',
    title: 'Oil mist collection',
    label: 'MACHINE AIR',
    description: 'Mist collection for machining, grinding and related industrial applications.',
    image: mist,
    features: ['Air Seiki mist collection solutions'],
    applications: [
      'Turning and machining centres',
      'Surface and cylindrical grinding',
      'Industrial saws and parts washing',
    ],
    source: { document: 'catalogue', pages: [25] },
  },
  {
    id: 'measuring-equipment',
    title: 'Measuring & test equipment',
    label: 'MEASURE · ALIGN',
    description: 'Granite plates, clamp force gauges and alignment equipment for the machine shop.',
    image: granite,
    features: ['Granite testing plates', 'Clamp force gauges', 'ATC alignment gauges'],
    applications: ['Setup inspection', 'Machine and tooling checks'],
    source: { document: 'catalogue', pages: [14, 24, 54] },
  },
  {
    id: 'ultrasonic-cleaning',
    title: 'Ultrasonic cleaning',
    label: 'COMPONENT CLEANING',
    description: 'Discuss the component, contamination and cleaning requirement with SHK.',
    features: ['Ultrasonic cleaning solutions'],
    applications: ['Component cleaning — suitability to be reviewed'],
    source: { document: 'business-card' },
  },
  {
    id: 'cam-programming',
    title: 'CAM / programming',
    label: 'SOLIDCAM',
    description: 'CAM solutions for milling, turning and multi-axis machining.',
    image: cam,
    features: [
      '2.5D milling and 3D machining',
      'Indexed and simultaneous multi-axis milling',
      'Turning and advanced mill-turn',
    ],
    applications: ['Machining programme preparation', 'Milling and turning'],
    source: { document: 'catalogue', pages: [26] },
  },
];
export const getProduct = (id: string) => products.find((p) => p.id === id);
export const compactorSpecs = [
  ['Briquette size', 'Ø100 × 50 mm', 'Ø75 × 50 mm'],
  ['Hydraulic force', '110 T', '150 T'],
  ['Electric motor', '15 HP', '15 HP'],
  ['Cycle time', '25 s', '30 s'],
  ['Machine size (L × W × H), mm', '1700 × 1900 × 2350', '1700 × 2000 × 2350'],
];
