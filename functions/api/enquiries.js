import { json } from '../_lib/auth.js';

const clean = (value, max = 500) => String(value ?? '').trim().slice(0, max);
const digits = (value) => clean(value, 40).replace(/\D/g, '');

function makeReference() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const suffix = crypto.randomUUID().replaceAll('-', '').slice(0, 6).toUpperCase();
  return `SHK-${date}-${suffix}`;
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: 'Enquiry storage is not configured.' }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid enquiry.' }, 400); }

  if (clean(body.website, 100)) return json({ ok: true }, 201);

  const name = clean(body.name, 100);
  const details = clean(body.details, 3000);
  const phone = clean(body.phone, 40);
  const email = clean(body.email, 150);
  if (!name || !details || (!phone && !email)) {
    return json({ error: 'Name, requirement and a contact method are required.' }, 400);
  }
  if (phone && digits(phone).length < 7) return json({ error: 'Phone number is not valid.' }, 400);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Email address is not valid.' }, 400);

  let reference = /^SHK-[A-Z0-9-]{6,40}$/i.test(clean(body.reference, 50))
    ? clean(body.reference, 50).toUpperCase()
    : makeReference();

  const id = crypto.randomUUID();
  const values = {
    id,
    reference,
    name,
    company: clean(body.company, 140),
    phone,
    email,
    location: clean(body.location, 120),
    type: clean(body.type, 80),
    product_condition: clean(body.productCondition, 80),
    quantity: clean(body.quantity, 30),
    quantity_unit: clean(body.quantityUnit, 30),
    usage_application: clean(body.usageApplication, 180),
    brand: clean(body.brand, 120),
    specification: clean(body.specification, 180),
    machine_type: clean(body.machineType, 120),
    machine_model: clean(body.machineModel, 150),
    category: clean(body.category, 180),
    details,
    preferred: clean(body.preferred, 40),
    selected_items: JSON.stringify(Array.isArray(body.selectedItems) ? body.selectedItems.slice(0, 20) : []),
    source_page: clean(body.sourcePage, 300),
  };

  const sql = `INSERT INTO enquiries (
    id, reference, name, company, phone, email, location, type, product_condition,
    quantity, quantity_unit, usage_application, brand, specification, machine_type,
    machine_model, category, details, preferred, selected_items, source_page, source_channel
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Website')`;

  const params = [
    values.id, values.reference, values.name, values.company, values.phone, values.email,
    values.location, values.type, values.product_condition, values.quantity, values.quantity_unit,
    values.usage_application, values.brand, values.specification, values.machine_type,
    values.machine_model, values.category, values.details, values.preferred, values.selected_items,
    values.source_page,
  ];

  try {
    await env.DB.prepare(sql).bind(...params).run();
  } catch (error) {
    if (String(error).toLowerCase().includes('unique')) {
      reference = makeReference();
      params[1] = reference;
      await env.DB.prepare(sql).bind(...params).run();
    } else {
      return json({ error: 'Unable to record the enquiry.' }, 500);
    }
  }

  await env.DB.prepare(
    'INSERT INTO enquiry_activity (id, enquiry_id, activity_type, note) VALUES (?, ?, ?, ?)',
  ).bind(crypto.randomUUID(), id, 'created', 'Enquiry received from the website.').run();

  return json({ ok: true, id, reference }, 201);
}
