<?php
require_once __DIR__ . '/config.php';
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
// The database is created by the hosting panel, never by a web request.
$conn = new mysqli($config['db_host'], $config['db_user'], $config['db_password'], $config['db_name'], (int) ($config['db_port'] ?? 3306));
$conn->set_charset('utf8mb4');
