import { createSessionCookie, json, passwordMatches } from '../../_lib/auth.js';

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
    return json({ error: 'Admin access is not configured.' }, 503);
  }
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid sign-in request.' }, 400); }
  const username = String(body?.username || '').trim();
  const password = String(body?.password || '');
  const expectedUser = env.ADMIN_USERNAME || 'shkadmin';
  const valid = username === expectedUser && await passwordMatches(password, env.ADMIN_PASSWORD);
  if (!valid) return json({ error: 'Incorrect username or password.' }, 401);
  return json({ ok: true }, 200, { 'set-cookie': await createSessionCookie(env) });
}
