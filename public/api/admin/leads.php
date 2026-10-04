<?php
declare(strict_types=1);
require dirname(__DIR__) . '/_bootstrap.php';
shk_require_admin();

$method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));
$pdo = shk_db();

if ($method === 'GET') {
    $search = shk_text($_GET['q'] ?? '', 160);
    $stage = shk_text($_GET['stage'] ?? '', 40);

    $where = [];
    $params = [];

    if ($search !== '') {
        $where[] = '(name LIKE ? OR company LIKE ? OR phone LIKE ? OR email LIKE ? OR reference LIKE ? OR category LIKE ?)';
        $like = '%' . $search . '%';
        array_push($params, $like, $like, $like, $like, $like, $like);
    }

    if ($stage !== '' && in_array($stage, SHK_ALLOWED_STAGES, true)) {
        $where[] = 'stage = ?';
        $params[] = $stage;
    }

    $sql =
        'SELECT id, reference, created_at, updated_at, stage, source, type, name, company, phone, email, ' .
        'location, product_condition, quantity, quantity_unit, usage_application, brand, specification, ' .
        'category, details, machine_type, machine_model, preferred, attachment_names_json, items_json, ' .
        'catalogue_json, delivery_json, notes FROM leads ' .
        ($where ? 'WHERE ' . implode(' AND ', $where) . ' ' : '') .
        'ORDER BY created_at DESC LIMIT 500';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $leads = [];

    foreach ($stmt->fetchAll() as $row) {
        foreach ([
            'attachment_names_json' => 'attachments',
            'items_json' => 'items',
            'catalogue_json' => 'catalogues',
            'delivery_json' => 'delivery',
        ] as $column => $target) {
            $decoded = json_decode((string)($row[$column] ?? ''), true);
            $row[$target] = is_array($decoded) ? $decoded : [];
            unset($row[$column]);
        }
        $leads[] = $row;
    }

    shk_json(['ok' => true, 'leads' => $leads]);
}

if ($method === 'PATCH' || ($method === 'POST' && ($_GET['_method'] ?? '') === 'PATCH')) {
    $body = shk_body();
    $id = (int)($body['id'] ?? 0);
    $stage = shk_text($body['stage'] ?? '', 40);
    $notes = shk_text($body['notes'] ?? '', 5000);

    if ($id < 1 || !in_array($stage, SHK_ALLOWED_STAGES, true)) {
        shk_json(['ok' => false, 'error' => 'Invalid lead update.'], 400);
    }

    $now = gmdate('Y-m-d H:i:s');
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare('UPDATE leads SET stage = ?, notes = ?, updated_at = ? WHERE id = ?');
        $stmt->execute([$stage, $notes, $now, $id]);

        $activity = $pdo->prepare(
            'INSERT INTO lead_activity (lead_id, created_at, event_type, detail) VALUES (?, ?, ?, ?)'
        );
        $activity->execute([$id, $now, 'stage', 'Stage changed to ' . $stage]);
        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log('SHK lead update failed: ' . $e->getMessage());
        shk_json(['ok' => false, 'error' => 'Could not save this lead update.'], 500);
    }

    shk_json(['ok' => true]);
}

shk_json(['ok' => false, 'error' => 'Method not allowed.'], 405);
