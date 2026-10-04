const allowed = new Set(['pdf','jpg','jpeg','png','webp','dwg','dxf','step','stp']);
const maxBytes = 15 * 1024 * 1024;

function safeName(name) {
  return String(name || 'attachment')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);
}

export async function onRequestPost(context) {
  if (!context.env.FILES) {
    return Response.json({ ok: false, error: 'Attachment storage is not configured.' }, { status: 503 });
  }

  const url = new URL(context.request.url);
  const origin = context.request.headers.get('Origin');
  if (origin && origin !== url.origin) {
    return Response.json({ ok: false, error: 'Invalid upload origin.' }, { status: 403 });
  }

  const rawName = context.request.headers.get('x-file-name') || 'attachment';
  const name = safeName(decodeURIComponent(rawName));
  const extension = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
  if (!allowed.has(extension)) {
    return Response.json({ ok: false, error: 'Unsupported attachment type.' }, { status: 415 });
  }

  const contentLength = Number(context.request.headers.get('content-length') || 0);
  if (contentLength > maxBytes) {
    return Response.json({ ok: false, error: 'Attachment is larger than 15 MB.' }, { status: 413 });
  }

  const bytes = await context.request.arrayBuffer();
  if (!bytes.byteLength || bytes.byteLength > maxBytes) {
    return Response.json({ ok: false, error: 'Invalid attachment size.' }, { status: 413 });
  }

  const now = new Date();
  const folder =
    now.getUTCFullYear() + '/' +
    String(now.getUTCMonth() + 1).padStart(2, '0') + '/' +
    String(now.getUTCDate()).padStart(2, '0');
  const key = 'enquiries/' + folder + '/' + crypto.randomUUID() + '-' + name;
  const type = context.request.headers.get('content-type') || 'application/octet-stream';

  await context.env.FILES.put(key, bytes, {
    httpMetadata: { contentType: type },
    customMetadata: { originalName: name },
  });

  return Response.json({
    ok: true,
    attachment: { key, name, size: bytes.byteLength, type },
  });
}
