const encoder = new TextEncoder();

function bytesToHex(bytes) {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hmac(secret, value) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return bytesToHex(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
}

function safeEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function cookieValue(request, name) {
  const raw = request.headers.get('cookie') || '';
  for (const item of raw.split(';')) {
    const [key, ...rest] = item.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return '';
}

export async function createSessionCookie(env) {
  if (!env.SESSION_SECRET) throw new Error('SESSION_SECRET is not configured');
  const expires = Date.now() + 12 * 60 * 60 * 1000;
  const payload = `v1.${expires}`;
  const signature = await hmac(env.SESSION_SECRET, payload);
  return `shk_admin=${payload}.${signature}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`;
}

export function clearSessionCookie() {
  return 'shk_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';
}

export async function isAdmin(request, env) {
  if (!env.SESSION_SECRET) return false;
  const token = cookieValue(request, 'shk_admin');
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'v1') return false;
  const expires = Number(parts[1]);
  if (!Number.isFinite(expires) || expires <= Date.now()) return false;
  const payload = `v1.${parts[1]}`;
  const expected = await hmac(env.SESSION_SECRET, payload);
  return safeEqual(expected, parts[2]);
}

export async function passwordMatches(supplied, expected) {
  if (!supplied || !expected) return false;
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(String(supplied))),
    crypto.subtle.digest('SHA-256', encoder.encode(String(expected))),
  ]);
  return safeEqual(bytesToHex(a), bytesToHex(b));
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });
}
