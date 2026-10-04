<?php
declare(strict_types=1);

/*
 * Copy this file to the private directory beside public_html:
 *
 *   /home/<account>/domains/<domain>/shk-private/config.php
 *
 * Do not place real passwords or API tokens in Git.
 */
return [
    'site' => [
        'base_url' => 'https://YOUR-DOMAIN.example',
    ],

    'database' => [
        'host' => 'localhost',
        'port' => 3306,
        'name' => 'YOUR_HOSTINGER_DATABASE',
        'user' => 'YOUR_HOSTINGER_DATABASE_USER',
        'password' => 'YOUR_HOSTINGER_DATABASE_PASSWORD',
        'charset' => 'utf8mb4',
    ],

    'admin' => [
        'username' => 'shk',
        // Generate with:
        // php -r "echo password_hash('YOUR_STRONG_PASSWORD', PASSWORD_DEFAULT), PHP_EOL;"
        'password_hash' => 'PASTE_PASSWORD_HASH_HERE',
    ],

    'mail' => [
        'enabled' => true,
        'host' => 'smtp.hostinger.com',
        'port' => 465,
        'encryption' => 'ssl',
        'username' => 'enquiries@YOUR-DOMAIN.example',
        'password' => 'YOUR_MAILBOX_PASSWORD',
        'from_email' => 'enquiries@YOUR-DOMAIN.example',
        'from_name' => 'SHK Tech Services',
        'alert_email' => 'shktechservices@gmail.com',
    ],

    // Optional. Automatic WhatsApp catalogue acknowledgements require the
    // Meta WhatsApp Business Platform and an approved message template.
    'whatsapp' => [
        'enabled' => false,
        'phone_number_id' => '',
        'token' => '',
        'template_name' => 'shk_enquiry_catalogue',
        'template_language' => 'en',
    ],
];
