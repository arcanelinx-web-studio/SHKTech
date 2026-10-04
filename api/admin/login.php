<?php
declare(strict_types=1);
require dirname(__DIR__) . '/_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    shk_json(['ok' => false, 'error' => 'Method not allowed.'], 405);
}

$body = shk_body();
$username = shk_text($body['username'] ?? '', 120);
$password = (string)($body['password'] ?? '');

$config = shk_config();
$admin = $config['admin'] ?? [];
$expectedUser = (string)($admin['username'] ?? '');
$hash = (string)($admin['password_hash'] ?? '');

if ($expectedUser === '' || $hash === '' || str_contains($hash, 'PASTE_PASSWORD_HASH')) {
    shk_json(['ok' => false, 'error' => 'Admin access is not configured yet.'], 503);
}

if (!hash_equals($expectedUser, $username) || !password_verify($password, $hash)) {
    usleep(350000);
    shk_json(['ok' => false, 'error' => 'Incorrect username or password.'], 401);
}

shk_start_session();
session_regenerate_id(true);
$_SESSION['shk_admin'] = true;
$_SESSION['shk_admin_user'] = $expectedUser;
$_SESSION['shk_admin_login_at'] = time();

shk_json(['ok' => true]);
