import { createAdminSession, sessionCookie } from '../../_lib/auth.js';

export async function onRequestPost(context) {
  let body;
  try { body = await context.request.json(); }
  catch { return Response.json({ ok: false, error: 'Invalid request.' }, { status: 400 }); }

  const username = String(body.username || '');
  const password = String(body.password || '');
  const expectedUser = context.env.ADMIN_USER;
  const expectedPassword = context.env.ADMIN_PASSWORD;
  const secret = context.env.ADMIN_SESSION_SECRET;

  if (!expectedUser || !expectedPassword || !secret) {
    return Response.json({ ok: false, error: 'Admin access has not been configured on this deployment.' }, { status: 503 });
  }
  if (username !== expectedUser || password !== expectedPassword) {
    return Response.json({ ok: false, error: 'Incorrect username or password.' }, { status: 401 });
  }

  const token = await createAdminSession(secret);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'set-cookie': sessionCookie(token),
      'cache-control': 'no-store',
    },
  });
}
