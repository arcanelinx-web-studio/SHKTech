const encoder = new TextEncoder();

function bytesToHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hmac(secret, value) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return bytesToHex(new Uint8Array(signature));
}

export async function createAdminSession(secret) {
  const expires = Date.now() + 1000 * 60 * 60 * 12;
  const payload = 'admin.' + expires;
  const signature = await hmac(secret, payload);
  return payload + '.' + signature;
}

export async function verifyAdminSession(request, secret) {
  if (!secret) return false;
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|;\s*)shk_admin_session=([^;]+)/);
  if (!match) return false;
  const token = decodeURIComponent(match[1]);
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'admin') return false;
  const expires = Number(parts[1]);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;
  const payload = 'admin.' + expires;
  const expected = await hmac(secret, payload);
  return expected === parts[2];
}

export function sessionCookie(token) {
  return 'shk_admin_session=' + encodeURIComponent(token) + '; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200';
}

export function clearSessionCookie() {
  return 'shk_admin_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';
}
