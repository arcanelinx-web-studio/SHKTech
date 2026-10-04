const catalogueMap = {
  'chip-conveyors': { title: 'Chip Conveyors', path: '/downloads/chip-conveyors.pdf' },
  'coolant-filtration': { title: 'Coolant, Sump Cleaning & Filtration', path: '/downloads/coolant-sump-cleaning-filtration.pdf' },
  'chip-compactors': { title: 'Chip Compactors', path: '/downloads/chip-compactors.pdf' },
  'mist-collectors': { title: 'Oil Mist Collection', path: '/downloads/oil-mist-collection.pdf' },
  'rotary-tables': { title: 'Rotary & Tilting Tables', path: '/downloads/rotary-tilting-tables.pdf' },
  'fixtures-clamping': { title: 'Fixtures & Clamping', path: '/downloads/fixtures-clamping.pdf' },
  'tool-holders': { title: 'Tool Holders & Pull Studs', path: '/downloads/tool-holders-pull-studs.pdf' },
  'angle-heads': { title: 'Custom Angle Heads', path: '/downloads/custom-angle-heads.pdf' },
  probing: { title: 'Probing & Tool Breakage', path: '/downloads/probing-tool-breakage.pdf' },
  'mandrels-chucks': { title: 'Mandrels & Chucks', path: '/downloads/mandrels-chucks.pdf' },
  'measuring-equipment': { title: 'Measuring & Test Equipment', path: '/downloads/measuring-test-equipment.pdf' },
  'cam-programming': { title: 'CAM / Programming', path: '/downloads/cam-programming.pdf' },
  'ultrasonic-cleaning': { title: 'Ultrasonic Cleaning', path: '/downloads/ultrasonic-cleaning.pdf' },
};

const titleToId = Object.fromEntries(
  Object.entries(catalogueMap).map(([id, catalogue]) => [catalogue.title.toLowerCase(), id]),
);

export function cataloguesForLead(payload, origin) {
  const ids = new Set();
  for (const item of Array.isArray(payload.items) ? payload.items : []) {
    if (item && catalogueMap[item.id]) ids.add(item.id);
  }
  const category = String(payload.category || '').trim().toLowerCase();
  if (titleToId[category]) ids.add(titleToId[category]);

  const selected = [...ids].slice(0, 4).map((id) => catalogueMap[id]);
  if (!selected.length) {
    selected.push({
      title: 'SHK Products & Services Portfolio',
      path: '/downloads/shk-products-services-current.pdf',
    });
  }

  return selected.map((item) => ({
    title: item.title,
    url: new URL(item.path, origin).href,
  }));
}
