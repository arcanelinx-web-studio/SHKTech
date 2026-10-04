import { isAdmin, json, type CRMEnv } from '../../../_lib/auth';

const STATUSES = ['New', 'Contacted', 'Qualified', 'Quotation', 'Follow-up', 'Won', 'Lost'];
const PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'];

function clean(value: unknown, max = 1000) {
  return String(value ?? '').trim().slice(0, max);
}

export const onRequestPatch: PagesFunction<CRMEnv> = async ({ request, env, params }) => {
  if (!(await isAdmin(request, env))) return json({ ok: false, error: 'Unauthorised.' }, 401);
  if (!env.DB) return json({ ok: false, error: 'CRM database is not configured.' }, 503);

  const id = clean(params.id, 100);
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid update.' }, 400);
  }

  const existing = await env.DB.prepare('SELECT * FROM enquiries WHERE id = ?').bind(id).first();
  if (!existing) return json({ ok: false, error: 'Enquiry not found.' }, 404);

  const status = STATUSES.includes(clean(body.status, 30)) ? clean(body.status, 30) : existing.status;
  const priority = PRIORITIES.includes(clean(body.priority, 30))
    ? clean(body.priority, 30)
    : existing.priority;
  const followUpAt = body.followUpAt === null ? null : clean(body.followUpAt, 50) || existing.follow_up_at;
  const assignedTo = body.assignedTo === null ? null : clean(body.assignedTo, 120) || existing.assigned_to;
  const now = new Date().toISOString();

  await env.DB.prepare(
    `UPDATE enquiries
     SET status = ?, priority = ?, follow_up_at = ?, assigned_to = ?, updated_at = ?
     WHERE id = ?`,
  )
    .bind(status, priority, followUpAt, assignedTo, now, id)
    .run();

  const note = clean(body.note, 2000);
  const kind = clean(body.kind, 40) || 'note';
  if (note) {
    await env.DB.prepare(
      `INSERT INTO enquiry_activity (enquiry_id, created_at, kind, note)
       VALUES (?, ?, ?, ?)`,
    )
      .bind(id, now, kind, note)
      .run();

    if (['call', 'email', 'whatsapp', 'meeting'].includes(kind)) {
      await env.DB.prepare('UPDATE enquiries SET last_contact_at = ? WHERE id = ?')
        .bind(now, id)
        .run();
    }
  }

  const updated = await env.DB.prepare(
    `SELECT * FROM enquiries WHERE id = ?`,
  )
    .bind(id)
    .first();
  return json({ ok: true, enquiry: updated });
};

export const onRequestGet: PagesFunction<CRMEnv> = async ({ request, env, params }) => {
  if (!(await isAdmin(request, env))) return json({ ok: false, error: 'Unauthorised.' }, 401);
  if (!env.DB) return json({ ok: false, error: 'CRM database is not configured.' }, 503);

  const id = clean(params.id, 100);
  const enquiry = await env.DB.prepare('SELECT * FROM enquiries WHERE id = ?').bind(id).first();
  if (!enquiry) return json({ ok: false, error: 'Enquiry not found.' }, 404);

  const activity = await env.DB.prepare(
    `SELECT id, created_at, kind, note FROM enquiry_activity
     WHERE enquiry_id = ? ORDER BY datetime(created_at) DESC LIMIT 100`,
  )
    .bind(id)
    .all();

  return json({ ok: true, enquiry, activity: activity.results || [] });
};
