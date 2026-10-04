<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    shk_json(['ok' => false, 'error' => 'Method not allowed.'], 405);
}

$origin = (string)($_SERVER['HTTP_ORIGIN'] ?? '');
if ($origin !== '') {
    $siteOrigin = preg_replace('#^([^:]+://[^/]+).*$#', '$1', shk_base_url());
    if (!hash_equals($siteOrigin, $origin)) {
        shk_json(['ok' => false, 'error' => 'Invalid upload origin.'], 403);
    }
}

$rawName = urldecode((string)($_SERVER['HTTP_X_FILE_NAME'] ?? 'attachment'));
$name = preg_replace('/[^a-zA-Z0-9._-]+/', '-', basename($rawName));
$name = trim((string)$name, '-.');
$name = mb_substr($name !== '' ? $name : 'attachment', 0, 120, 'UTF-8');

$extension = strtolower(pathinfo($name, PATHINFO_EXTENSION));
$allowed = ['pdf','jpg','jpeg','png','webp','dwg','dxf','step','stp'];
if (!in_array($extension, $allowed, true)) {
    shk_json(['ok' => false, 'error' => 'Unsupported attachment type.'], 415);
}

$maxBytes = 15 * 1024 * 1024;
$contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength > $maxBytes) {
    shk_json(['ok' => false, 'error' => 'Attachment is larger than 15 MB.'], 413);
}

$bytes = file_get_contents('php://input');
if ($bytes === false || $bytes === '' || strlen($bytes) > $maxBytes) {
    shk_json(['ok' => false, 'error' => 'Invalid attachment size.'], 413);
}

$private = shk_private_dir();
$folder = $private . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . gmdate('Y') .
    DIRECTORY_SEPARATOR . gmdate('m') . DIRECTORY_SEPARATOR . gmdate('d');

if (!is_dir($folder) && !mkdir($folder, 0750, true) && !is_dir($folder)) {
    shk_json(['ok' => false, 'error' => 'Secure attachment storage is unavailable.'], 503);
}

$key = 'uploads/' . gmdate('Y/m/d') . '/' . bin2hex(random_bytes(12)) . '-' . $name;
$path = $private . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $key);

if (file_put_contents($path, $bytes, LOCK_EX) === false) {
    shk_json(['ok' => false, 'error' => 'Could not store this attachment.'], 500);
}
@chmod($path, 0640);

$type = shk_text($_SERVER['CONTENT_TYPE'] ?? 'application/octet-stream', 120);
shk_json([
    'ok' => true,
    'attachment' => [
        'key' => $key,
        'name' => $name,
        'size' => strlen($bytes),
        'type' => $type,
    ],
]);
