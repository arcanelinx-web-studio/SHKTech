import { cataloguesForLead } from '../_lib/catalogues.js';

function cleanText(value, max = 3000) {
  return String(value || '').trim().slice(0, max);
}

function cleanItems(items) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, 50).map((item) => ({
    id: cleanText(item && item.id, 100),
    title: cleanText(item && item.title, 180),
    kind: cleanText(item && item.kind, 40),
    note: cleanText(item && item.note, 1000),
  })).filter((item) => item.id && item.title);
}

function makeReference() {
  const d = new Date();
  const date =
    d.getUTCFullYear() +
    String(d.getUTCMonth() + 1).padStart(2, '0') +
    String(d.getUTCDate()).padStart(2, '0');
  const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();
  return 'SHK-' + date + '-' + suffix;
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function sendCustomerEmail(env, payload, reference, catalogues) {
  if (!payload.email || !env.RESEND_API_KEY || !env.ENQUIRY_FROM_EMAIL) {
    return { attempted: false, sent: false };
  }

  const links = catalogues.map((c) =>
    '<li style="margin:8px 0"><a href="' + escapeHtml(c.url) + '">' + escapeHtml(c.title) + '</a></li>'
  ).join('');

  const html =
    '<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#18222a">' +
      '<div style="background:#0b1115;color:#fff;padding:28px 32px;border-bottom:4px solid #1e8fe1">' +
        '<div style="font-size:13px;letter-spacing:.12em;color:#9fb0ba">SHK TECH SERVICES · BENGALURU</div>' +
        '<h1 style="font-size:28px;margin:10px 0 0">Thank you for your enquiry.</h1>' +
      '</div>' +
      '<div style="padding:30px 32px;background:#f6f7f5">' +
        '<p>Hi ' + escapeHtml(payload.name) + ',</p>' +
        '<p>We have received your requirement. Your reference is <strong>' + escapeHtml(reference) + '</strong>.</p>' +
        '<p><strong>Relevant catalogue:</strong></p><ul>' + links + '</ul>' +
        '<p>An SHK engineer can use your submitted machine and application details to continue the discussion.</p>' +
        '<p style="margin-top:28px">Responsible Engineering.<br><strong>SHK Tech Services</strong></p>' +
      '</div>' +
    '</div>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + env.RESEND_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.ENQUIRY_FROM_EMAIL,
      to: [payload.email],
      reply_to: env.SHK_ALERT_EMAIL || undefined,
      subject: 'SHK enquiry ' + reference + ' · catalogue',
      html,
    }),
  });

  return { attempted: true, sent: response.ok };
}

async function sendInternalAlert(env, payload, reference, catalogues) {
  if (!env.RESEND_API_KEY || !env.ENQUIRY_FROM_EMAIL || !env.SHK_ALERT_EMAIL) {
    return { attempted: false, sent: false };
  }

  const items = payload.items.length
    ? payload.items.map((item) => '• ' + item.title + (item.note ? ' — ' + item.note : '')).join('\n')
    : 'No enquiry-list items selected';

  const message = [
    'New SHK website enquiry',
    '',
    'Reference: ' + reference,
    'Name: ' + payload.name,
    'Company: ' + (payload.company || '-'),
    'Phone: ' + (payload.phone || '-'),
    'Email: ' + (payload.email || '-'),
    'Location: ' + (payload.location || '-'),
    'Type: ' + (payload.type || '-'),
    'Category: ' + (payload.category || '-'),
    'Brand: ' + (payload.brand || '-'),
    'Specification: ' + (payload.specification || '-'),
    'Quantity: ' + (payload.quantity || '-') + ' ' + (payload.quantityUnit || ''),
    'Application: ' + (payload.usageApplication || '-'),
    'Machine: ' + (payload.machineType || '-') + ' ' + (payload.machineModel || ''),
    'Preferred contact: ' + (payload.preferred || '-'),
    '',
    'Requirement:',
    payload.details,
    '',
    'Selected:',
    items,
    '',
    'Catalogue links:',
    ...catalogues.map((c) => c.title + ': ' + c.url),
  ].join('\n');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + env.RESEND_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.ENQUIRY_FROM_EMAIL,
      to: [env.SHK_ALERT_EMAIL],
      subject: 'New SHK website enquiry · ' + reference + ' · ' + payload.name,
      text: message,
    }),
  });

  return { attempted: true, sent: response.ok };
}

async function sendWhatsAppTemplate(env, payload, reference, catalogues) {
  if (
    !payload.whatsappOptIn ||
    !payload.phone ||
    !env.WHATSAPP_TOKEN ||
    !env.WHATSAPP_PHONE_NUMBER_ID ||
    !env.WHATSAPP_TEMPLATE_NAME
  ) {
    return { attempted: false, sent: false };
  }

  const phone = payload.phone.replace(/\D/g, '');
  if (phone.length < 8) return { attempted: false, sent: false };

  const catalogue = catalogues[0];
  const response = await fetch(
    'https://graph.facebook.com/v22.0/' + env.WHATSAPP_PHONE_NUMBER_ID + '/messages',
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + env.WHATSAPP_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'template',
        template: {
          name: env.WHATSAPP_TEMPLATE_NAME,
          language: { code: env.WHATSAPP_TEMPLATE_LANGUAGE || 'en' },
          components: [{
            type: 'body',
            parameters: [
              { type: 'text', text: payload.name },
              { type: 'text', text: reference },
              { type: 'text', text: catalogue.url },
            ],
          }],
        },
      }),
    },
  );

  return { attempted: true, sent: response.ok };
}

export async function onRequestPost(context) {
  if (!context.env.DB) {
    return Response.json(
      { ok: false, error: 'The enquiry service is not configured on this deployment.' },
      { status: 503 },
    );
  }

  let raw;
  try { raw = await context.request.json(); }
  catch { return Response.json({ ok: false, error: 'Invalid enquiry.' }, { status: 400 }); }

  if (cleanText(raw.website, 100)) {
    return Response.json({ ok: true, reference: 'received', catalogues: [], delivery: {} });
  }

  const payload = {
    type: cleanText(raw.type, 80),
    name: cleanText(raw.name, 100),
    company: cleanText(raw.company, 140),
    phone: cleanText(raw.phone, 40),
    email: cleanText(raw.email, 160).toLowerCase(),
    location: cleanText(raw.location, 140),
    productCondition: cleanText(raw.productCondition, 80),
    quantity: cleanText(raw.quantity, 30),
    quantityUnit: cleanText(raw.quantityUnit, 30),
    usageApplication: cleanText(raw.usageApplication, 200),
    brand: cleanText(raw.brand, 120),
    specification: cleanText(raw.specification, 200),
    category: cleanText(raw.category, 180),
    details: cleanText(raw.details, 3000),
    machineType: cleanText(raw.machineType, 120),
    machineModel: cleanText(raw.machineModel, 180),
    preferred: cleanText(raw.preferred, 40),
    attachmentNames: Array.isArray(raw.attachmentNames)
      ? raw.attachmentNames.slice(0, 10).map((v) => cleanText(v, 200))
      : [],
    attachments: Array.isArray(raw.attachments)
      ? raw.attachments.slice(0, 10).map((v) => ({
          key: cleanText(v && v.key, 500),
          name: cleanText(v && v.name, 200),
          type: cleanText(v && v.type, 120),
          size: Number(v && v.size) || 0,
        })).filter((v) => v.key && v.name)
      : [],
    items: cleanItems(raw.items),
    whatsappOptIn: Boolean(raw.whatsappOptIn),
  };

  if (!payload.name || !payload.details || (!payload.phone && !payload.email)) {
    return Response.json(
      { ok: false, error: 'Name, requirement and a contact method are required.' },
      { status: 400 },
    );
  }

  const origin = new URL(context.request.url).origin;
  const reference = makeReference();
  const catalogues = cataloguesForLead(payload, origin);
  const now = new Date().toISOString();

  const result = await context.env.DB.prepare(
    'INSERT INTO leads (' +
      'reference, created_at, updated_at, stage, source, type, name, company, phone, email, ' +
      'location, product_condition, quantity, quantity_unit, usage_application, brand, ' +
      'specification, category, details, machine_type, machine_model, preferred, ' +
      'attachment_names_json, items_json, catalogue_json, delivery_json, notes' +
    ') VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    reference, now, now, 'New', 'Website', payload.type, payload.name, payload.company,
    payload.phone, payload.email, payload.location, payload.productCondition, payload.quantity,
    payload.quantityUnit, payload.usageApplication, payload.brand, payload.specification,
    payload.category, payload.details, payload.machineType, payload.machineModel,
    payload.preferred, JSON.stringify(payload.attachments.length ? payload.attachments : payload.attachmentNames), JSON.stringify(payload.items),
    JSON.stringify(catalogues), '{}', ''
  ).run();

  const leadId = result.meta && result.meta.last_row_id ? result.meta.last_row_id : null;
  if (leadId) {
    await context.env.DB.prepare(
      'INSERT INTO lead_activity (lead_id, created_at, event_type, detail) VALUES (?, ?, ?, ?)'
    ).bind(leadId, now, 'created', 'Website enquiry received').run();
  }

  const results = await Promise.all([
    sendCustomerEmail(context.env, payload, reference, catalogues),
    sendInternalAlert(context.env, payload, reference, catalogues),
    sendWhatsAppTemplate(context.env, payload, reference, catalogues),
  ]);

  const delivery = {
    customerEmail: results[0],
    internalEmail: results[1],
    whatsapp: results[2],
  };

  await context.env.DB.prepare(
    'UPDATE leads SET delivery_json = ?, updated_at = ? WHERE reference = ?'
  ).bind(JSON.stringify(delivery), new Date().toISOString(), reference).run();

  return Response.json({ ok: true, reference, catalogues, delivery });
}
