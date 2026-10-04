import { clearSessionCookie, json, type CRMEnv } from '../../_lib/auth';

export const onRequestPost: PagesFunction<CRMEnv> = async () =>
  json({ ok: true }, 200, { 'set-cookie': clearSessionCookie() });
