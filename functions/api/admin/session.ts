import { isAdmin, json, type CRMEnv, type PagesFunction } from '../../_lib/auth';

export const onRequestGet: PagesFunction<CRMEnv> = async ({ request, env }) => {
  const authenticated = await isAdmin(request, env);
  return json({ authenticated });
};
