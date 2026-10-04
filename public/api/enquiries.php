<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    shk_json(['ok' => false, 'error' => 'Method not allowed.'], 405);
}

$raw = shk_body();

if (shk_text($raw['website'] ?? '', 100) !== '') {
    shk_json(['ok' => true, 'reference' => 'received', 'catalogues' => [], 'delivery' => []]);
}

$payload = [
    'type' => shk_text($raw['type'] ?? '', 80),
    'name' => shk_text($raw['name'] ?? '', 100),
    'company' => shk_text($raw['company'] ?? '', 140),
    'phone' => shk_text($raw['phone'] ?? '', 40),
    'email' => strtolower(shk_text($raw['email'] ?? '', 160)),
    'location' => shk_text($raw['location'] ?? '', 140),
    'productCondition' => shk_text($raw['productCondition'] ?? '', 80),
    'quantity' => shk_text($raw['quantity'] ?? '', 30),
    'quantityUnit' => shk_text($raw['quantityUnit'] ?? '', 30),
    'usageApplication' => shk_text($raw['usageApplication'] ?? '', 200),
    'brand' => shk_text($raw['brand'] ?? '', 120),
    'specification' => shk_text($raw['specification'] ?? '', 200),
    'category' => shk_text($raw['category'] ?? '', 180),
    'details' => shk_text($raw['details'] ?? '', 3000),
    'machineType' => shk_text($raw['machineType'] ?? '', 120),
    'machineModel' => shk_text($raw['machineModel'] ?? '', 180),
    'preferred' => shk_text($raw['preferred'] ?? '', 40),
    'attachmentNames' => [],
    'attachments' => [],
    'items' => shk_clean_items($raw['items'] ?? []),
    'whatsappOptIn' => !empty($raw['whatsappOptIn']),
];

if (is_array($raw['attachmentNames'] ?? null)) {
    foreach (array_slice($raw['attachmentNames'], 0, 10) as $name) {
        $payload['attachmentNames'][] = shk_text($name, 200);
    }
}

if (is_array($raw['attachments'] ?? null)) {
    foreach (array_slice($raw['attachments'], 0, 10) as $attachment) {
        if (!is_array($attachment)) continue;
        $key = shk_text($attachment['key'] ?? '', 500);
        $name = shk_text($attachment['name'] ?? '', 200);
        if ($key === '' || $name === '') continue;
        $payload['attachments'][] = [
            'key' => $key,
            'name' => $name,
            'type' => shk_text($attachment['type'] ?? '', 120),
            'size' => max(0, (int)($attachment['size'] ?? 0)),
        ];
    }
}

if ($payload['name'] === '' || $payload['details'] === '' || ($payload['phone'] === '' && $payload['email'] === '')) {
    shk_json(['ok' => false, 'error' => 'Name, requirement and a contact method are required.'], 400);
}

if ($payload['email'] !== '' && !filter_var($payload['email'], FILTER_VALIDATE_EMAIL)) {
    shk_json(['ok' => false, 'error' => 'Please enter a valid email address.'], 400);
}

$digits = preg_replace('/\D+/', '', $payload['phone']);
if ($payload['phone'] !== '' && strlen($digits) < 7) {
    shk_json(['ok' => false, 'error' => 'Please enter a valid phone number.'], 400);
}

$reference = shk_reference();
$catalogues = shk_catalogues_for_lead($payload);
$now = gmdate('Y-m-d H:i:s');

$attachmentJson = json_encode(
    $payload['attachments'] ?: $payload['attachmentNames'],
    JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
);
$itemJson = json_encode($payload['items'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
$catalogueJson = json_encode($catalogues, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

$pdo = shk_db();
try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare(
        'INSERT INTO leads (
            reference, created_at, updated_at, stage, source, type, name, company, phone, email,
            location, product_condition, quantity, quantity_unit, usage_application, brand,
            specification, category, details, machine_type, machine_model, preferred,
            attachment_names_json, items_json, catalogue_json, delivery_json, notes
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )'
    );

    $stmt->execute([
        $reference, $now, $now, 'New', 'Website', $payload['type'], $payload['name'],
        $payload['company'], $payload['phone'], $payload['email'], $payload['location'],
        $payload['productCondition'], $payload['quantity'], $payload['quantityUnit'],
        $payload['usageApplication'], $payload['brand'], $payload['specification'],
        $payload['category'], $payload['details'], $payload['machineType'],
        $payload['machineModel'], $payload['preferred'], $attachmentJson, $itemJson,
        $catalogueJson, '{}', ''
    ]);

    $leadId = (int)$pdo->lastInsertId();
    $activity = $pdo->prepare(
        'INSERT INTO lead_activity (lead_id, created_at, event_type, detail) VALUES (?, ?, ?, ?)'
    );
    $activity->execute([$leadId, $now, 'created', 'Website enquiry received']);

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    error_log('SHK enquiry insert failed: ' . $e->getMessage());
    shk_json(['ok' => false, 'error' => 'We could not record this enquiry. Please continue on WhatsApp.'], 500);
}

$linksHtml = '';
foreach ($catalogues as $catalogue) {
    $title = htmlspecialchars((string)$catalogue['title'], ENT_QUOTES, 'UTF-8');
    $url = htmlspecialchars((string)$catalogue['url'], ENT_QUOTES, 'UTF-8');
    $linksHtml .= '<li style="margin:8px 0"><a href="' . $url . '">' . $title . '</a></li>';
}

$customerEmail = ['attempted' => false, 'sent' => false];
if ($payload['email'] !== '') {
    $customerHtml =
        '<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#18222a">' .
        '<div style="background:#0b1115;color:#fff;padding:28px 32px;border-bottom:4px solid #1e8fe1">' .
        '<div style="font-size:12px;letter-spacing:.12em;color:#a8b5bd">SHK TECH SERVICES · BENGALURU</div>' .
        '<h1 style="font-size:28px;margin:10px 0 0">Thank you for your enquiry.</h1></div>' .
        '<div style="padding:30px 32px;background:#f6f7f5">' .
        '<p>Hi ' . htmlspecialchars($payload['name'], ENT_QUOTES, 'UTF-8') . ',</p>' .
        '<p>We have received your requirement. Your reference is <strong>' .
        htmlspecialchars($reference, ENT_QUOTES, 'UTF-8') . '</strong>.</p>' .
        '<p><strong>Your relevant SHK catalogue:</strong></p><ul>' . $linksHtml . '</ul>' .
        '<p>Our engineering team will review your machine and application details and follow up.</p>' .
        '<p style="margin-top:26px"><strong>SHK Tech Services</strong><br>Responsible Engineering.</p>' .
        '</div></div>';

    $config = shk_config();
    $replyTo = (string)($config['mail']['alert_email'] ?? '');
    $customerEmail = shk_send_email(
        $payload['email'],
        'SHK enquiry ' . $reference . ' · catalogue',
        $customerHtml,
        $replyTo !== '' ? $replyTo : null
    );
}

$config = shk_config();
$alert = (string)($config['mail']['alert_email'] ?? '');
$internalEmail = ['attempted' => false, 'sent' => false];

if ($alert !== '' && filter_var($alert, FILTER_VALIDATE_EMAIL)) {
    $itemLines = [];
    foreach ($payload['items'] as $item) {
        $itemLines[] = htmlspecialchars(
            (string)$item['title'] . ((string)$item['note'] !== '' ? ' — ' . (string)$item['note'] : ''),
            ENT_QUOTES,
            'UTF-8'
        );
    }

    $internalHtml =
        '<div style="font-family:Arial,sans-serif;max-width:720px;margin:auto;color:#18222a">' .
        '<h2>New SHK website enquiry</h2>' .
        '<p><strong>Reference:</strong> ' . htmlspecialchars($reference, ENT_QUOTES, 'UTF-8') . '</p>' .
        '<p><strong>Name:</strong> ' . htmlspecialchars($payload['name'], ENT_QUOTES, 'UTF-8') . '<br>' .
        '<strong>Company:</strong> ' . htmlspecialchars($payload['company'] ?: '-', ENT_QUOTES, 'UTF-8') . '<br>' .
        '<strong>Phone:</strong> ' . htmlspecialchars($payload['phone'] ?: '-', ENT_QUOTES, 'UTF-8') . '<br>' .
        '<strong>Email:</strong> ' . htmlspecialchars($payload['email'] ?: '-', ENT_QUOTES, 'UTF-8') . '<br>' .
        '<strong>Location:</strong> ' . htmlspecialchars($payload['location'] ?: '-', ENT_QUOTES, 'UTF-8') . '</p>' .
        '<p><strong>Category:</strong> ' . htmlspecialchars($payload['category'] ?: $payload['type'], ENT_QUOTES, 'UTF-8') . '<br>' .
        '<strong>Brand:</strong> ' . htmlspecialchars($payload['brand'] ?: '-', ENT_QUOTES, 'UTF-8') . '<br>' .
        '<strong>Specification:</strong> ' . htmlspecialchars($payload['specification'] ?: '-', ENT_QUOTES, 'UTF-8') . '<br>' .
        '<strong>Quantity:</strong> ' . htmlspecialchars(trim($payload['quantity'] . ' ' . $payload['quantityUnit']), ENT_QUOTES, 'UTF-8') . '<br>' .
        '<strong>Application:</strong> ' . htmlspecialchars($payload['usageApplication'] ?: '-', ENT_QUOTES, 'UTF-8') . '</p>' .
        '<p><strong>Requirement</strong><br>' . nl2br(htmlspecialchars($payload['details'], ENT_QUOTES, 'UTF-8')) . '</p>' .
        ($itemLines ? '<p><strong>Selected items</strong><br>' . implode('<br>', $itemLines) . '</p>' : '') .
        '<p><strong>Catalogue links</strong></p><ul>' . $linksHtml . '</ul>' .
        '<p>Open the SHK Admin lead desk for attachments, internal notes and follow-up status.</p>' .
        '</div>';

    $internalEmail = shk_send_email(
        $alert,
        'New SHK website enquiry · ' . $reference . ' · ' . $payload['name'],
        $internalHtml,
        $payload['email'] !== '' ? $payload['email'] : null
    );
}

$whatsapp = shk_send_whatsapp_template($payload, $reference, $catalogues);
$delivery = [
    'customerEmail' => $customerEmail,
    'internalEmail' => $internalEmail,
    'whatsapp' => $whatsapp,
];

try {
    $stmt = $pdo->prepare('UPDATE leads SET delivery_json = ?, updated_at = ? WHERE reference = ?');
    $stmt->execute([
        json_encode($delivery, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
        gmdate('Y-m-d H:i:s'),
        $reference
    ]);
} catch (Throwable $e) {
    error_log('SHK delivery status update failed: ' . $e->getMessage());
}

shk_json([
    'ok' => true,
    'reference' => $reference,
    'catalogues' => $catalogues,
    'delivery' => $delivery,
]);
