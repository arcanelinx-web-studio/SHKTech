export interface D1Result<T = Record<string, unknown>> {
  results?: T[];
  success?: boolean;
  meta?: Record<string, unknown>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export interface PagesContext<Env> {
  request: Request;
  env: Env;
  params: Record<string, string | string[]>;
}

export type PagesFunction<Env> = (
  context: PagesContext<Env>,
) => Response | Promise<Response>;

export interface CRMEnv {
  DB: D1Database;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  SESSION_SECRET: string;
}

const encoder = new TextEncoder();

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function hmac(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

export async function createSessionCookie(env: CRMEnv) {
  const payload = bytesToBase64Url(
    encoder.encode(
      JSON.stringify({
        role: 'admin',
        exp: Date.now() + 8 * 60 * 60 * 1000,
      }),
    ),
  );
  const signature = await hmac(env.SESSION_SECRET, payload);
  return `shk_admin_session=${payload}.${signature}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`;
}

export function clearSessionCookie() {
  return 'shk_admin_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';
}

function cookieValue(request: Request, key: string) {
  const cookie = request.headers.get('Cookie') || '';
  for (const part of cookie.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === key) return rest.join('=');
  }
  return '';
}

export async function isAdmin(request: Request, env: CRMEnv) {
  const token = cookieValue(request, 'shk_admin_session');
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !env.SESSION_SECRET) return false;
  const expected = await hmac(env.SESSION_SECRET, payload);
  const a = base64UrlToBytes(signature);
  const b = base64UrlToBytes(expected);
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a[i]! ^ b[i]!;
  if (mismatch !== 0) return false;
  try {
    const data = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload)));
    return data.role === 'admin' && Number(data.exp) > Date.now();
  } catch {
    return false;
  }
}

export function json(data: unknown, status = 200, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...headers,
    },
  });
}
