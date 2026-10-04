import { createSessionCookie, json, type CRMEnv, type PagesFunction } from '../../_lib/auth';

export const onRequestPost: PagesFunction<CRMEnv> = async ({ request, env }) => {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
    return json({ ok: false, error: 'Admin access is not configured.' }, 503);
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid request.' }, 400);
  }

  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const validEmail = email === env.ADMIN_EMAIL.trim().toLowerCase();
  const validPassword = password === env.ADMIN_PASSWORD;

  if (!validEmail || !validPassword) {
    await new Promise((resolve) => setTimeout(resolve, 450));
    return json({ ok: false, error: 'Incorrect email or password.' }, 401);
  }

  return json(
    { ok: true },
    200,
    { 'set-cookie': await createSessionCookie(env) },
  );
};
