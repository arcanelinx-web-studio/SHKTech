import type { Industry } from './types';
export const industries: Industry[] = [
  ['Automotive', 'Workholding · production machining'],
  ['Aerospace', 'Multi-axis machining · measurement'],
  ['Die & mould', 'Tooling · CAM'],
  ['Medical', 'Workholding · component machining'],
  ['Railways', 'Machining · machine services'],
  ['Defence', 'Fixtures · precision workholding'],
  ['Energy', 'Machining · metrology'],
  ['Pump & motor', 'Mandrels · chucks'],
  ['Construction', 'Machining · chip handling'],
  ['General engineering', 'Tooling · machine services'],
  ['Tractor & farm equipment', 'Workholding · machining'],
  ['Education & training', 'CAM · measurement'],
].map(([name, applications]) => ({
  name: name!,
  applications: applications!,
  source: { document: 'catalogue', pages: [55] },
}));
