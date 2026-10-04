import { isAdmin, json, type CRMEnv } from '../_lib/auth';

const STATUSES = ['New', 'Contacted', 'Qualified', 'Quotation', 'Follow-up', 'Won', 'Lost'];

function clean(value: unknown, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}

function reference(value: unknown) {
  const provided = clean(value, 40).replace(/[^A-Za-z0-9_-]/g, '');
  if (provided) return provided;
  return `SHK-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}

export const onRequestPost: PagesFunction<CRMEnv> = async ({ request, env }) => {
  if (!env.DB) return json({ ok: false, error: 'Enquiry storage is not configured.' }, 503);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid enquiry.' }, 400);
  }

  const name = clean(body.name, 100);
  const details = clean(body.details, 3000);
  const phone = clean(body.phone, 40);
  const email = clean(body.email, 160);
  if (!name || !details || (!phone && !email)) {
    return json({ ok: false, error: 'Name, requirement and contact details are required.' }, 400);
  }

  const ref = reference(body.reference);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const selectedItems = Array.isArray(body.selectedItems)
    ? JSON.stringify(body.selectedItems).slice(0, 12000)
    : '[]';

  await env.DB.prepare(
    `INSERT OR IGNORE INTO enquiries (
      id, reference, created_at, updated_at, source, status, priority,
      name, company, phone, email, location, enquiry_type, product_condition,
      quantity, quantity_unit, usage_application, brand, specification,
      machine_type, machine_model, category, details, preferred_contact,
      selected_items, whatsapp_message
    ) VALUES (?, ?, ?, ?, ?, 'New', 'Normal', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      ref,
      now,
      now,
      clean(body.source || 'Website', 80),
      name,
      clean(body.company, 140),
      phone,
      email,
      clean(body.location, 140),
      clean(body.type, 80),
      clean(body.productCondition, 80),
      Number(body.quantity || 0) || null,
      clean(body.quantityUnit, 30),
      clean(body.usageApplication, 220),
      clean(body.brand, 140),
      clean(body.specification, 220),
      clean(body.machineType, 120),
      clean(body.machineModel, 180),
      clean(body.category, 180),
      details,
      clean(body.preferred, 50),
      selectedItems,
      clean(body.whatsappMessage, 12000),
    )
    .run();

  const row = await env.DB.prepare('SELECT id, reference FROM enquiries WHERE reference = ?')
    .bind(ref)
    .first<{ id: string; reference: string }>();

  if (row?.id === id) {
    await env.DB.prepare(
      `INSERT INTO enquiry_activity (enquiry_id, created_at, kind, note)
       VALUES (?, ?, 'created', 'Enquiry received from website')`,
    )
      .bind(id, now)
      .run();
  }

  return json({ ok: true, reference: ref });
};

export const onRequestGet: PagesFunction<CRMEnv> = async ({ request, env }) => {
  if (!(await isAdmin(request, env))) return json({ ok: false, error: 'Unauthorised.' }, 401);
  if (!env.DB) return json({ ok: false, error: 'CRM database is not configured.' }, 503);

  const url = new URL(request.url);
  const status = clean(url.searchParams.get('status'), 30);
  const search = clean(url.searchParams.get('search'), 100);
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 100), 1), 250);

  const conditions: string[] = [];
  const values: unknown[] = [];
  if (status && STATUSES.includes(status)) {
    conditions.push('status = ?');
    values.push(status);
  }
  if (search) {
    conditions.push(
      '(name LIKE ? OR company LIKE ? OR phone LIKE ? OR email LIKE ? OR reference LIKE ? OR category LIKE ?)',
    );
    const term = `%${search}%`;
    values.push(term, term, term, term, term, term);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const query = `
    SELECT id, reference, created_at, updated_at, source, status, priority,
      name, company, phone, email, location, enquiry_type, product_condition,
      quantity, quantity_unit, usage_application, brand, specification,
      machine_type, machine_model, category, details, preferred_contact,
      selected_items, follow_up_at, assigned_to, last_contact_at
    FROM enquiries
    ${where}
    ORDER BY
      CASE priority WHEN 'Urgent' THEN 0 WHEN 'High' THEN 1 WHEN 'Normal' THEN 2 ELSE 3 END,
      datetime(created_at) DESC
    LIMIT ?
  `;

  const result = await env.DB.prepare(query).bind(...values, limit).all();
  const counts = await env.DB.prepare(
    `SELECT status, COUNT(*) AS count FROM enquiries GROUP BY status`,
  ).all();
  const total = await env.DB.prepare('SELECT COUNT(*) AS count FROM enquiries').first<{ count: number }>();
  const due = await env.DB.prepare(
    `SELECT COUNT(*) AS count FROM enquiries
     WHERE follow_up_at IS NOT NULL
       AND datetime(follow_up_at) <= datetime('now', '+1 day')
       AND status NOT IN ('Won', 'Lost')`,
  ).first<{ count: number }>();

  return json({
    ok: true,
    enquiries: result.results || [],
    summary: {
      total: Number(total?.count || 0),
      due: Number(due?.count || 0),
      byStatus: counts.results || [],
    },
  });
};
