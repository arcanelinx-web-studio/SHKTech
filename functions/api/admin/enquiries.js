import { isAdmin, json } from '../../_lib/auth.js';

const stages = new Set(['new','contacted','qualified','quotation','follow-up','won','lost']);
const priorities = new Set(['low','normal','high','urgent']);
const clean = (value, max = 4000) => String(value ?? '').trim().slice(0, max);

async function detail(DB, id) {
  const enquiry = await DB.prepare('SELECT * FROM enquiries WHERE id = ?').bind(id).first();
  if (!enquiry) return null;
  const activities = await DB.prepare(
    'SELECT id, created_at, activity_type, note FROM enquiry_activity WHERE enquiry_id = ? ORDER BY created_at DESC LIMIT 100',
  ).bind(id).all();
  return { ...enquiry, activities: activities.results || [] };
}

export async function onRequestGet({ request, env }) {
  if (!await isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401);
  if (!env.DB) return json({ error: 'Enquiry database is not configured.' }, 503);
  const id = new URL(request.url).searchParams.get('id');
  if (id) {
    const enquiry = await detail(env.DB, id);
    return enquiry ? json({ enquiry }) : json({ error: 'Enquiry not found.' }, 404);
  }
  const rows = await env.DB.prepare(
    'SELECT * FROM enquiries ORDER BY datetime(created_at) DESC LIMIT 1000',
  ).all();
  return json({ enquiries: rows.results || [] });
}

export async function onRequestPatch({ request, env }) {
  if (!await isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401);
  if (!env.DB) return json({ error: 'Enquiry database is not configured.' }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid update.' }, 400); }
  const id = clean(body.id, 80);
  if (!id) return json({ error: 'Enquiry id is required.' }, 400);
  const existing = await env.DB.prepare('SELECT id FROM enquiries WHERE id = ?').bind(id).first();
  if (!existing) return json({ error: 'Enquiry not found.' }, 404);

  const stage = stages.has(body.stage) ? body.stage : 'new';
  const priority = priorities.has(body.priority) ? body.priority : 'normal';
  const owner = clean(body.owner, 120);
  const nextFollowUp = /^\d{4}-\d{2}-\d{2}$/.test(clean(body.next_follow_up, 20)) ? clean(body.next_follow_up, 20) : '';
  const notes = clean(body.internal_notes, 6000);
  const activity = clean(body.activity_note, 2000);

  await env.DB.prepare(
    `UPDATE enquiries
     SET stage = ?, priority = ?, owner = ?, next_follow_up = ?, internal_notes = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
  ).bind(stage, priority, owner, nextFollowUp, notes, id).run();

  if (activity) {
    await env.DB.prepare(
      'INSERT INTO enquiry_activity (id, enquiry_id, activity_type, note) VALUES (?, ?, ?, ?)',
    ).bind(crypto.randomUUID(), id, 'note', activity).run();
  }

  return json({ ok: true, enquiry: await detail(env.DB, id) });
}
