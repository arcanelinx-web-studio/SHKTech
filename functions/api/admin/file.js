import { verifyAdminSession } from '../../_lib/auth.js';

export async function onRequestGet(context) {
  if (!(await verifyAdminSession(context.request, context.env.ADMIN_SESSION_SECRET))) {
    return Response.json({ ok: false, error: 'Authentication required.' }, { status: 401 });
  }
  if (!context.env.FILES) {
    return Response.json({ ok: false, error: 'Attachment storage is not configured.' }, { status: 503 });
  }

  const key = new URL(context.request.url).searchParams.get('key') || '';
  if (!key.startsWith('enquiries/')) {
    return Response.json({ ok: false, error: 'Invalid attachment.' }, { status: 400 });
  }

  const object = await context.env.FILES.get(key);
  if (!object) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'private, no-store');
  const original = object.customMetadata && object.customMetadata.originalName
    ? object.customMetadata.originalName
    : 'attachment';
  headers.set('content-disposition', 'attachment; filename="' + original.replace(/"/g, '') + '"');

  return new Response(object.body, { headers });
}
