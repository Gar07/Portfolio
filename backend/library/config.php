<?php
$configFile = dirname(__DIR__, 2) . '/config.local.php';
if (!is_file($configFile)) throw new RuntimeException('Salin config.example.php ke config.local.php dan isi koneksi database.');
$config = require $configFile;
foreach (['environment','origin','db_host','db_name','db_user','db_password'] as $key) {
    if (!isset($config[$key]) || !is_string($config[$key])) throw new RuntimeException("Konfigurasi $key tidak valid.");
}
if (!in_array($config['environment'], ['local','production'], true)) throw new RuntimeException('Environment tidak valid.');
$originParts=parse_url($config['origin']);
if (!filter_var($config['origin'],FILTER_VALIDATE_URL) || !in_array($originParts['scheme'] ?? '',['http','https'],true) || array_intersect(['user','pass','path','query','fragment'],array_keys($originParts))) throw new RuntimeException('Origin harus scheme://host dengan port opsional, tanpa slash penutup/path.');
if ($config['environment'] === 'production' && (!str_starts_with($config['origin'], 'https://') || $config['db_password'] === '' || str_starts_with($config['db_name'], 'YOUR_'))) {
    throw new RuntimeException('Produksi memerlukan origin HTTPS dan kredensial database yang sudah diisi.');
}
