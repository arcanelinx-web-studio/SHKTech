<?php
declare(strict_types=1);
require dirname(__DIR__) . '/_bootstrap.php';
shk_require_admin();

$key = shk_text($_GET['key'] ?? '', 500);
if ($key === '' || !str_starts_with($key, 'uploads/')) {
    shk_json(['ok' => false, 'error' => 'Invalid attachment.'], 400);
}

$private = shk_private_dir();
$base = realpath($private . DIRECTORY_SEPARATOR . 'uploads');
$path = realpath($private . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $key));

if ($base === false || $path === false || !str_starts_with($path, $base . DIRECTORY_SEPARATOR) || !is_file($path)) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Attachment not found.';
    exit;
}

$name = basename($path);
$name = preg_replace('/^[a-f0-9]{24}-/', '', $name);
$extension = strtolower(pathinfo($name, PATHINFO_EXTENSION));
$contentTypes = [
    'pdf' => 'application/pdf',
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'webp' => 'image/webp',
    'dwg' => 'application/octet-stream',
    'dxf' => 'application/dxf',
    'step' => 'application/step',
    'stp' => 'application/step',
];

header('Cache-Control: private, no-store');
header('X-Content-Type-Options: nosniff');
header('Content-Type: ' . ($contentTypes[$extension] ?? 'application/octet-stream'));
header('Content-Length: ' . filesize($path));
header('Content-Disposition: attachment; filename="' . str_replace('"', '', $name) . '"');
readfile($path);
exit;
