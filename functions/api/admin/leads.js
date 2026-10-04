import { verifyAdminSession } from '../../_lib/auth.js';

const stages = new Set(['New', 'Contacted', 'Qualified', 'Quotation', 'Follow-up', 'Won', 'Lost']);

function unauthorized() {
  return Response.json({ ok: false, error: 'Authentication required.' }, { status: 401 });
}

function safeJson(value, fallback) {
  try { return JSON.parse(value || ''); }
  catch { return fallback; }
}

export async function onRequestGet(context) {
  if (!(await verifyAdminSession(context.request, context.env.ADMIN_SESSION_SECRET))) return unauthorized();
  if (!context.env.DB) {
    return Response.json({ ok: false, error: 'Lead database is not configured.' }, { status: 503 });
  }

  const url = new URL(context.request.url);
  const search = (url.searchParams.get('q') || '').trim();
  const stage = (url.searchParams.get('stage') || '').trim();
  const params = [];
  const where = [];

  if (search) {
    where.push('(name LIKE ? OR company LIKE ? OR phone LIKE ? OR email LIKE ? OR reference LIKE ? OR category LIKE ?)');
    const like = '%' + search + '%';
    params.push(like, like, like, like, like, like);
  }
  if (stage && stages.has(stage)) {
    where.push('stage = ?');
    params.push(stage);
  }

  const sql =
    'SELECT id, reference, created_at, updated_at, stage, source, type, name, company, phone, email, ' +
    'location, product_condition, quantity, quantity_unit, usage_application, brand, specification, ' +
    'category, details, machine_type, machine_model, preferred, attachment_names_json, items_json, catalogue_json, delivery_json, notes ' +
    'FROM leads ' + (where.length ? 'WHERE ' + where.join(' AND ') + ' ' : '') +
    'ORDER BY created_at DESC LIMIT 500';

  const result = await context.env.DB.prepare(sql).bind(...params).all();
  const leads = (result.results || []).map((row) => ({
    ...row,
    attachments: safeJson(row.attachment_names_json, []),
    items: safeJson(row.items_json, []),
    catalogues: safeJson(row.catalogue_json, []),
    delivery: safeJson(row.delivery_json, {}),
  }));
  return Response.json({ ok: true, leads }, { headers: { 'cache-control': 'no-store' } });
}

export async function onRequestPatch(context) {
  if (!(await verifyAdminSession(context.request, context.env.ADMIN_SESSION_SECRET))) return unauthorized();
  if (!context.env.DB) {
    return Response.json({ ok: false, error: 'Lead database is not configured.' }, { status: 503 });
  }

  let body;
  try { body = await context.request.json(); }
  catch { return Response.json({ ok: false, error: 'Invalid request.' }, { status: 400 }); }

  const id = Number(body.id);
  const stage = String(body.stage || '');
  const notes = String(body.notes || '').slice(0, 5000);
  if (!Number.isInteger(id) || !stages.has(stage)) {
    return Response.json({ ok: false, error: 'Invalid lead update.' }, { status: 400 });
  }

  const now = new Date().toISOString();
  await context.env.DB.prepare(
    'UPDATE leads SET stage = ?, notes = ?, updated_at = ? WHERE id = ?',
  ).bind(stage, notes, now, id).run();

  await context.env.DB.prepare(
    'INSERT INTO lead_activity (lead_id, created_at, event_type, detail) VALUES (?, ?, ?, ?)',
  ).bind(id, now, 'stage', 'Stage changed to ' + stage).run();

  return Response.json({ ok: true });
}
