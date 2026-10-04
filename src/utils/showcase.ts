const STORAGE_KEY = 'shk_showcase_leads_v1';

type Catalogue = { title: string; url: string };
type ShowcaseLead = Record<string, any>;

const catalogues: Record<string, { title: string; file: string }> = {
  'rotary-tables': { title: 'Rotary & Tilting Tables', file: 'SHK-Catalogue-01-Rotary-Tilting-Tables.pdf' },
  'fixtures-clamping': { title: 'Fixtures & Clamping', file: 'SHK-Catalogue-02-Fixtures-Clamping.pdf' },
  'tool-holders': { title: 'Tool Holders & Pull Studs', file: 'SHK-Catalogue-03-Tool-Holders-Pull-Studs.pdf' },
  'angle-heads': { title: 'Custom Angle Heads', file: 'SHK-Catalogue-04-Custom-Angle-Heads.pdf' },
  probing: { title: 'Probing & Tool Breakage', file: 'SHK-Catalogue-05-Probing-Tool-Breakage.pdf' },
  'mandrels-chucks': { title: 'Mandrels & Chucks', file: 'SHK-Catalogue-06-Mandrels-Chucks.pdf' },
  'chip-conveyors': { title: 'Chip Conveyors', file: 'SHK-Catalogue-07-Chip-Conveyors.pdf' },
  'coolant-filtration': { title: 'Coolant, Sump Cleaning & Filtration', file: 'SHK-Catalogue-08-Coolant-Sump-Cleaning-Filtration.pdf' },
  'chip-compactors': { title: 'Chip Compactors', file: 'SHK-Catalogue-09-Chip-Compactors.pdf' },
  'mist-collectors': { title: 'Oil Mist Collection', file: 'SHK-Catalogue-10-Oil-Mist-Collection.pdf' },
  'measuring-equipment': { title: 'Measuring & Test Equipment', file: 'SHK-Catalogue-11-Measuring-Test-Equipment.pdf' },
  'cam-programming': { title: 'CAM / Programming', file: 'SHK-Catalogue-12-CAM-Programming.pdf' },
  'ultrasonic-cleaning': { title: 'Ultrasonic Cleaning', file: 'SHK-Catalogue-13-Ultrasonic-Cleaning.pdf' },
  'machine-services': { title: 'Machine Services', file: 'SHK-Catalogue-14-Machine-Services.pdf' },
};

function basePath() {
  const base = import.meta.env.BASE_URL || '/';
  return base === '/' ? '' : base.replace(/\/$/, '');
}

function publicUrl(path: string) {
  return new URL(basePath() + path, window.location.origin).href;
}

export function isShowcaseMode() {
  return window.location.hostname.endsWith('github.io') || new URLSearchParams(window.location.search).has('showcase');
}

export function cataloguesForShowcase(payload: any): Catalogue[] {
  const ids = new Set<string>();

  // Only map brands where the supplied SHK material explicitly supports the product family.
  const brandToCatalogue: Record<string, string> = {
    oilmax: 'coolant-filtration',
    'air seiki': 'mist-collectors',
    solidcam: 'cam-programming',
  };
  for (const item of Array.isArray(payload?.items) ? payload.items : []) {
    if (item?.id && catalogues[item.id]) ids.add(item.id);
  }

  const category = String(payload?.category || '').trim().toLowerCase();
  for (const [id, catalogue] of Object.entries(catalogues)) {
    if (catalogue.title.toLowerCase() === category) ids.add(id);
  }

  const brand = String(payload?.brand || '').trim().toLowerCase();
  const brandCatalogue = brandToCatalogue[brand];
  if (brandCatalogue) ids.add(brandCatalogue);

  const type = String(payload?.type || '').toLowerCase();
  if (!ids.size && ['calibration', 'reconditioning', 'retrofit', 'technical consultation'].includes(type)) {
    ids.add('machine-services');
  }

  const selected = [...ids].slice(0, 3).map((id) => catalogues[id]!);
  const links = selected.map((catalogue) => ({
    title: catalogue.title,
    url: publicUrl('/downloads/' + catalogue.file),
  }));

  // Standard customer handoff: relevant technical material first, company profile second.
  links.push({
    title: 'SHK Tech Services Company Profile',
    url: publicUrl('/downloads/SHK-Tech-Services-Company-Profile.pdf'),
  });

  return links;
}

function defaultShowcaseLeads(): ShowcaseLead[] {
  const now = Date.now();
  return [
    {
      id: now - 3,
      reference: 'SHK-DEMO-001',
      created_at: new Date(now - 1000 * 60 * 38).toISOString(),
      updated_at: new Date(now - 1000 * 60 * 24).toISOString(),
      stage: 'New',
      source: 'Website showcase',
      type: 'Product',
      name: 'Demo enquiry — Production Engineering',
      company: 'Client preview record',
      phone: '+91 98XXXXXX10',
      email: 'engineering@example.com',
      location: 'Bengaluru',
      product_condition: 'New',
      quantity: '2',
      quantity_unit: 'Set',
      usage_application: 'Coolant maintenance on CNC machining line',
      brand: '',
      specification: 'Centralized coolant tank',
      category: 'Coolant, Sump Cleaning & Filtration',
      details: 'Looking for a practical sump-cleaning and filtration solution with minimum machine stoppage.',
      machine_type: 'Horizontal Machining Centre',
      machine_model: 'Multiple machines',
      preferred: 'WhatsApp',
      attachments: ['coolant-layout-demo.pdf'],
      items: [{ id: 'coolant-filtration', title: 'Coolant, Sump Cleaning & Filtration', kind: 'product', note: '' }],
      catalogues: [{
        title: 'Coolant, Sump Cleaning & Filtration',
        url: publicUrl('/downloads/SHK-Catalogue-08-Coolant-Sump-Cleaning-Filtration.pdf'),
      }],
      delivery: { showcase: true },
      notes: '',
    },
    {
      id: now - 2,
      reference: 'SHK-DEMO-002',
      created_at: new Date(now - 1000 * 60 * 60 * 20).toISOString(),
      updated_at: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
      stage: 'Quotation',
      source: 'Website showcase',
      type: 'Product',
      name: 'Demo enquiry — Tool Room',
      company: 'Client preview record',
      phone: '+91 98XXXXXX22',
      email: 'toolroom@example.com',
      location: 'Pune',
      product_condition: 'New',
      quantity: '1',
      quantity_unit: 'Set',
      usage_application: '5-axis machining fixture',
      brand: '',
      specification: 'Repeatable workholding',
      category: 'Fixtures & Clamping',
      details: 'Need fixture and clamping concept review for a repeat production component.',
      machine_type: 'Vertical Machining Centre',
      machine_model: '5-axis VMC',
      preferred: 'Email',
      attachments: ['component-drawing-demo.pdf'],
      items: [{ id: 'fixtures-clamping', title: 'Fixtures & Clamping', kind: 'product', note: '' }],
      catalogues: [{
        title: 'Fixtures & Clamping',
        url: publicUrl('/downloads/SHK-Catalogue-02-Fixtures-Clamping.pdf'),
      }],
      delivery: { showcase: true },
      notes: 'Demo record showing quotation-stage tracking.',
    },
    {
      id: now - 1,
      reference: 'SHK-DEMO-003',
      created_at: new Date(now - 1000 * 60 * 60 * 52).toISOString(),
      updated_at: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
      stage: 'Follow-up',
      source: 'Website showcase',
      type: 'Calibration',
      name: 'Demo enquiry — Quality Team',
      company: 'Client preview record',
      phone: '+91 98XXXXXX35',
      email: 'quality@example.com',
      location: 'Bengaluru',
      product_condition: 'Not sure',
      quantity: '1',
      quantity_unit: 'No.',
      usage_application: 'Machine geometry verification',
      brand: '',
      specification: 'Laser / ballbar service',
      category: '',
      details: 'Require machine condition verification before deciding corrective action.',
      machine_type: 'Vertical Machining Centre',
      machine_model: '',
      preferred: 'Phone',
      attachments: [],
      items: [],
      catalogues: [{
        title: 'Machine Services',
        url: publicUrl('/downloads/SHK-Catalogue-14-Machine-Services.pdf'),
      }],
      delivery: { showcase: true },
      notes: 'Demo record showing follow-up history.',
    },
  ];
}

export function loadShowcaseLeads(): ShowcaseLead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = defaultShowcaseLeads();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaultShowcaseLeads();
  } catch {
    return defaultShowcaseLeads();
  }
}

function persist(leads: ShowcaseLead[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

export function saveShowcaseLead(payload: any, reference: string) {
  const leads = loadShowcaseLeads();
  const now = new Date().toISOString();
  const catalogueLinks = cataloguesForShowcase(payload);
  const lead = {
    id: Date.now(),
    reference,
    created_at: now,
    updated_at: now,
    stage: 'New',
    source: 'Website showcase',
    type: payload.type,
    name: payload.name,
    company: payload.company,
    phone: payload.phone,
    email: payload.email,
    location: payload.location,
    product_condition: payload.productCondition,
    quantity: payload.quantity,
    quantity_unit: payload.quantityUnit,
    usage_application: payload.usageApplication,
    brand: payload.brand,
    specification: payload.specification,
    category: payload.category,
    details: payload.details,
    machine_type: payload.machineType,
    machine_model: payload.machineModel,
    preferred: payload.preferred,
    attachments: payload.attachmentNames || [],
    items: payload.items || [],
    catalogues: catalogueLinks,
    delivery: { showcase: true },
    notes: '',
  };
  leads.unshift(lead);
  persist(leads.slice(0, 100));
  return {
    ok: true,
    reference,
    catalogues: catalogueLinks,
    delivery: { showcase: true },
    lead,
  };
}

export function updateShowcaseLead(id: number, stage: string, notes: string) {
  const leads = loadShowcaseLeads();
  const lead = leads.find((item) => Number(item.id) === Number(id));
  if (!lead) return false;
  lead.stage = stage;
  lead.notes = notes;
  lead.updated_at = new Date().toISOString();
  persist(leads);
  return true;
}

export function resetShowcaseLeads() {
  const seeded = defaultShowcaseLeads();
  persist(seeded);
  return seeded;
}
