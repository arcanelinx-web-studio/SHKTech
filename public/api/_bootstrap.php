<?php
declare(strict_types=1);

const SHK_ALLOWED_STAGES = ['New', 'Contacted', 'Qualified', 'Quotation', 'Follow-up', 'Won', 'Lost'];

function shk_json(array $payload, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function shk_text(mixed $value, int $max = 3000): string {
    $value = trim((string)($value ?? ''));
    return mb_substr($value, 0, $max, 'UTF-8');
}

function shk_body(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function shk_config_path(): ?string {
    $fromEnv = getenv('SHK_CONFIG_PATH');
    if (is_string($fromEnv) && $fromEnv !== '' && is_file($fromEnv)) return $fromEnv;

    $documentRoot = rtrim((string)($_SERVER['DOCUMENT_ROOT'] ?? ''), DIRECTORY_SEPARATOR);
    if ($documentRoot !== '') {
        $outside = dirname($documentRoot) . DIRECTORY_SEPARATOR . 'shk-private' . DIRECTORY_SEPARATOR . 'config.php';
        if (is_file($outside)) return $outside;

        $inside = $documentRoot . DIRECTORY_SEPARATOR . '.shk-private' . DIRECTORY_SEPARATOR . 'config.php';
        if (is_file($inside)) return $inside;
    }
    return null;
}

function shk_config(): array {
    static $config;
    if (is_array($config)) return $config;

    $path = shk_config_path();
    if (!$path) {
        shk_json([
            'ok' => false,
            'error' => 'SHK server configuration is not installed yet.'
        ], 503);
    }

    $loaded = require $path;
    if (!is_array($loaded)) {
        shk_json(['ok' => false, 'error' => 'Invalid SHK server configuration.'], 503);
    }
    $config = $loaded;
    return $config;
}

function shk_db(): PDO {
    static $pdo;
    if ($pdo instanceof PDO) return $pdo;

    $config = shk_config();
    $db = $config['database'] ?? [];
    $host = (string)($db['host'] ?? 'localhost');
    $port = (int)($db['port'] ?? 3306);
    $name = (string)($db['name'] ?? '');
    $user = (string)($db['user'] ?? '');
    $password = (string)($db['password'] ?? '');
    $charset = (string)($db['charset'] ?? 'utf8mb4');

    if ($name === '' || $user === '') {
        shk_json(['ok' => false, 'error' => 'Database settings are incomplete.'], 503);
    }

    try {
        $pdo = new PDO(
            "mysql:host={$host};port={$port};dbname={$name};charset={$charset}",
            $user,
            $password,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_PERSISTENT => true,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
    } catch (Throwable $e) {
        error_log('SHK database connection failed: ' . $e->getMessage());
        shk_json(['ok' => false, 'error' => 'The enquiry database is temporarily unavailable.'], 503);
    }

    return $pdo;
}

function shk_is_https(): bool {
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') return true;
    return (string)($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
}

function shk_start_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    session_name('shk_admin_session');
    session_set_cookie_params([
        'lifetime' => 43200,
        'path' => '/',
        'secure' => shk_is_https(),
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

function shk_require_admin(): void {
    shk_start_session();
    if (empty($_SESSION['shk_admin']) || $_SESSION['shk_admin'] !== true) {
        shk_json(['ok' => false, 'error' => 'Authentication required.'], 401);
    }
}

function shk_reference(): string {
    return 'SHK-' . gmdate('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(5)), 0, 7));
}

function shk_base_url(): string {
    $config = shk_config();
    $configured = rtrim((string)($config['site']['base_url'] ?? ''), '/');
    if ($configured !== '' && !str_contains($configured, 'YOUR-DOMAIN')) return $configured;

    $scheme = shk_is_https() ? 'https' : 'http';
    $host = preg_replace('/[^a-zA-Z0-9.\-:]/', '', (string)($_SERVER['HTTP_HOST'] ?? 'localhost'));
    return $scheme . '://' . $host;
}

function shk_catalogue_map(): array {
    return [
        'rotary-tables' => ['title' => 'Rotary & Tilting Tables', 'path' => '/downloads/SHK-Catalogue-01-Rotary-Tilting-Tables.pdf'],
        'fixtures-clamping' => ['title' => 'Fixtures & Clamping', 'path' => '/downloads/SHK-Catalogue-02-Fixtures-Clamping.pdf'],
        'tool-holders' => ['title' => 'Tool Holders & Pull Studs', 'path' => '/downloads/SHK-Catalogue-03-Tool-Holders-Pull-Studs.pdf'],
        'angle-heads' => ['title' => 'Custom Angle Heads', 'path' => '/downloads/SHK-Catalogue-04-Custom-Angle-Heads.pdf'],
        'probing' => ['title' => 'Probing & Tool Breakage', 'path' => '/downloads/SHK-Catalogue-05-Probing-Tool-Breakage.pdf'],
        'mandrels-chucks' => ['title' => 'Mandrels & Chucks', 'path' => '/downloads/SHK-Catalogue-06-Mandrels-Chucks.pdf'],
        'chip-conveyors' => ['title' => 'Chip Conveyors', 'path' => '/downloads/SHK-Catalogue-07-Chip-Conveyors.pdf'],
        'coolant-filtration' => ['title' => 'Coolant, Sump Cleaning & Filtration', 'path' => '/downloads/SHK-Catalogue-08-Coolant-Sump-Cleaning-Filtration.pdf'],
        'chip-compactors' => ['title' => 'Chip Compactors', 'path' => '/downloads/SHK-Catalogue-09-Chip-Compactors.pdf'],
        'mist-collectors' => ['title' => 'Oil Mist Collection', 'path' => '/downloads/SHK-Catalogue-10-Oil-Mist-Collection.pdf'],
        'measuring-equipment' => ['title' => 'Measuring & Test Equipment', 'path' => '/downloads/SHK-Catalogue-11-Measuring-Test-Equipment.pdf'],
        'cam-programming' => ['title' => 'CAM / Programming', 'path' => '/downloads/SHK-Catalogue-12-CAM-Programming.pdf'],
        'ultrasonic-cleaning' => ['title' => 'Ultrasonic Cleaning', 'path' => '/downloads/SHK-Catalogue-13-Ultrasonic-Cleaning.pdf'],
        'machine-services' => ['title' => 'Machine Services', 'path' => '/downloads/SHK-Catalogue-14-Machine-Services.pdf'],
    ];
}

function shk_catalogues_for_lead(array $payload): array {
    $map = shk_catalogue_map();
    $ids = [];

    $items = $payload['items'] ?? [];
    if (is_array($items)) {
        foreach ($items as $item) {
            $id = is_array($item) ? (string)($item['id'] ?? '') : '';
            if ($id !== '' && isset($map[$id])) $ids[$id] = true;
        }
    }

    $category = strtolower(trim((string)($payload['category'] ?? '')));
    foreach ($map as $id => $catalogue) {
        if ($category !== '' && strtolower($catalogue['title']) === $category) $ids[$id] = true;
    }

    $type = strtolower(trim((string)($payload['type'] ?? '')));
    if (!$ids && in_array($type, ['calibration', 'reconditioning', 'retrofit', 'technical consultation'], true)) {
        $ids['machine-services'] = true;
    }

    $selected = [];
    foreach (array_keys($ids) as $id) {
        $selected[] = $map[$id];
        if (count($selected) >= 4) break;
    }

    if (!$selected) {
        $selected[] = [
            'title' => 'SHK Tech Services Company Profile',
            'path' => '/downloads/SHK-Tech-Services-Company-Profile.pdf',
        ];
    }

    $base = shk_base_url();
    return array_map(static fn(array $item): array => [
        'title' => $item['title'],
        'url' => $base . $item['path'],
    ], $selected);
}

function shk_private_dir(): string {
    $configPath = shk_config_path();
    if ($configPath) return dirname($configPath);

    $documentRoot = rtrim((string)($_SERVER['DOCUMENT_ROOT'] ?? ''), DIRECTORY_SEPARATOR);
    return dirname($documentRoot) . DIRECTORY_SEPARATOR . 'shk-private';
}

function shk_read_smtp_response($socket): string {
    $response = '';
    while (($line = fgets($socket, 515)) !== false) {
        $response .= $line;
        if (strlen($line) < 4 || $line[3] === ' ') break;
    }
    return $response;
}

function shk_smtp_command($socket, string $command, array $expected): string {
    fwrite($socket, $command . "\r\n");
    $response = shk_read_smtp_response($socket);
    $code = (int)substr($response, 0, 3);
    if (!in_array($code, $expected, true)) {
        throw new RuntimeException('SMTP error ' . $code . ': ' . trim($response));
    }
    return $response;
}

function shk_send_email(string $to, string $subject, string $html, ?string $replyTo = null): array {
    $config = shk_config();
    $mail = $config['mail'] ?? [];
    if (empty($mail['enabled']) || empty($mail['host']) || empty($mail['username']) || empty($mail['password'])) {
        return ['attempted' => false, 'sent' => false];
    }

    $host = (string)$mail['host'];
    $port = (int)($mail['port'] ?? 465);
    $encryption = strtolower((string)($mail['encryption'] ?? 'ssl'));
    $transportHost = $encryption === 'ssl' ? 'ssl://' . $host : $host;
    $errno = 0;
    $errstr = '';

    try {
        $socket = stream_socket_client(
            $transportHost . ':' . $port,
            $errno,
            $errstr,
            15,
            STREAM_CLIENT_CONNECT
        );
        if (!$socket) throw new RuntimeException('SMTP connection failed: ' . $errstr);
        stream_set_timeout($socket, 15);

        $greeting = shk_read_smtp_response($socket);
        if ((int)substr($greeting, 0, 3) !== 220) throw new RuntimeException('SMTP greeting rejected.');

        $serverName = preg_replace('/[^a-zA-Z0-9.\-]/', '', (string)($_SERVER['SERVER_NAME'] ?? 'localhost'));
        shk_smtp_command($socket, 'EHLO ' . ($serverName ?: 'localhost'), [250]);

        if ($encryption === 'tls' || $encryption === 'starttls') {
            shk_smtp_command($socket, 'STARTTLS', [220]);
            if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new RuntimeException('SMTP TLS negotiation failed.');
            }
            shk_smtp_command($socket, 'EHLO ' . ($serverName ?: 'localhost'), [250]);
        }

        shk_smtp_command($socket, 'AUTH LOGIN', [334]);
        shk_smtp_command($socket, base64_encode((string)$mail['username']), [334]);
        shk_smtp_command($socket, base64_encode((string)$mail['password']), [235]);

        $fromEmail = (string)($mail['from_email'] ?? $mail['username']);
        $fromName = trim((string)($mail['from_name'] ?? 'SHK Tech Services'));
        shk_smtp_command($socket, 'MAIL FROM:<' . $fromEmail . '>', [250]);
        shk_smtp_command($socket, 'RCPT TO:<' . $to . '>', [250, 251]);
        shk_smtp_command($socket, 'DATA', [354]);

        $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
        $encodedFromName = '=?UTF-8?B?' . base64_encode($fromName) . '?=';
        $headers = [
            'Date: ' . date(DATE_RFC2822),
            'From: ' . $encodedFromName . ' <' . $fromEmail . '>',
            'To: <' . $to . '>',
            'Subject: ' . $encodedSubject,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            'Content-Transfer-Encoding: 8bit',
            'Message-ID: <' . bin2hex(random_bytes(8)) . '@' . ($serverName ?: 'localhost') . '>',
        ];
        if ($replyTo) $headers[] = 'Reply-To: ' . $replyTo;

        $body = str_replace(["\r\n", "\r"], "\n", $html);
        $body = preg_replace('/^\./m', '..', $body);
        $message = implode("\r\n", $headers) . "\r\n\r\n" . str_replace("\n", "\r\n", $body) . "\r\n.";
        shk_smtp_command($socket, $message, [250]);
        shk_smtp_command($socket, 'QUIT', [221]);
        fclose($socket);

        return ['attempted' => true, 'sent' => true];
    } catch (Throwable $e) {
        error_log('SHK SMTP error: ' . $e->getMessage());
        if (isset($socket) && is_resource($socket)) fclose($socket);
        return ['attempted' => true, 'sent' => false];
    }
}

function shk_send_whatsapp_template(array $payload, string $reference, array $catalogues): array {
    $config = shk_config();
    $wa = $config['whatsapp'] ?? [];
    if (
        empty($wa['enabled']) ||
        empty($payload['whatsappOptIn']) ||
        empty($payload['phone']) ||
        empty($wa['phone_number_id']) ||
        empty($wa['token']) ||
        empty($wa['template_name']) ||
        !$catalogues
    ) {
        return ['attempted' => false, 'sent' => false];
    }

    $phone = preg_replace('/\D+/', '', (string)$payload['phone']);
    if (strlen($phone) < 8) return ['attempted' => false, 'sent' => false];

    $body = [
        'messaging_product' => 'whatsapp',
        'to' => $phone,
        'type' => 'template',
        'template' => [
            'name' => (string)$wa['template_name'],
            'language' => ['code' => (string)($wa['template_language'] ?? 'en')],
            'components' => [[
                'type' => 'body',
                'parameters' => [
                    ['type' => 'text', 'text' => (string)$payload['name']],
                    ['type' => 'text', 'text' => $reference],
                    ['type' => 'text', 'text' => (string)$catalogues[0]['url']],
                ],
            ]],
        ],
    ];

    $curl = curl_init('https://graph.facebook.com/v22.0/' . rawurlencode((string)$wa['phone_number_id']) . '/messages');
    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . (string)$wa['token'],
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode($body, JSON_UNESCAPED_SLASHES),
        CURLOPT_TIMEOUT => 15,
    ]);
    curl_exec($curl);
    $status = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $error = curl_error($curl);
    curl_close($curl);

    if ($error !== '') error_log('SHK WhatsApp error: ' . $error);
    return ['attempted' => true, 'sent' => $status >= 200 && $status < 300];
}

function shk_clean_items(mixed $items): array {
    if (!is_array($items)) return [];
    $clean = [];
    foreach (array_slice($items, 0, 50) as $item) {
        if (!is_array($item)) continue;
        $id = shk_text($item['id'] ?? '', 100);
        $title = shk_text($item['title'] ?? '', 180);
        if ($id === '' || $title === '') continue;
        $clean[] = [
            'id' => $id,
            'title' => $title,
            'kind' => shk_text($item['kind'] ?? '', 40),
            'note' => shk_text($item['note'] ?? '', 1000),
        ];
    }
    return $clean;
}
