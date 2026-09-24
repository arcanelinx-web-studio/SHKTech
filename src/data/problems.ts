import type { Problem } from './types';
export const problems: Problem[] = [
  {
    id: 'accuracy',
    title: 'My machine has lost accuracy',
    description: 'Part dimensions drifting, poor circularity or alignment concerns.',
    products: ['measuring-equipment'],
    services: ['laser-calibration', 'ball-bar-testing', 'geometrical-alignment'],
  },
  {
    id: 'setups',
    title: 'Setups take too long',
    description: 'Too much time clamping, re-indexing and aligning the part.',
    products: ['rotary-tables', 'fixtures-clamping'],
    services: [],
  },
  {
    id: 'workholding',
    title: 'The part is hard to hold',
    description: 'Bores, gears and complex shapes that need a better grip.',
    products: ['mandrels-chucks', 'fixtures-clamping'],
    services: [],
  },
  {
    id: 'coolant',
    title: 'Chips & coolant cost us money',
    description: 'Swarf building up, contaminated fluid and frequent sump changes.',
    products: ['chip-conveyors', 'coolant-filtration', 'chip-compactors'],
    services: [],
  },
  {
    id: 'stoppages',
    title: 'The machine keeps stopping',
    description: 'Worn spindles, machine elements and ageing subsystems.',
    products: [],
    services: ['spindle-reconditioning', 'machine-reconditioning', 'retrofit'],
  },
  {
    id: 'capability',
    title: 'We need more from the same machine',
    description: 'Reach another face. Add an axis. Improve the machining cycle.',
    products: ['angle-heads', 'rotary-tables', 'probing', 'cam-programming'],
    services: [],
  },
];
