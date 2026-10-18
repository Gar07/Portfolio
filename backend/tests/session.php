<?php
ob_start();
require __DIR__ . '/validation.php';
require_once __DIR__ . '/../library/config.php';
require_once __DIR__ . '/../library/commonfunction.php';
// Test production cookie attributes without opening a database connection.
$config['environment']='production';
portfolioSession();
$params=session_get_cookie_params();
expect($params['secure'] && $params['httponly'] && $params['samesite'] === 'Strict' && $params['path'] === '/api');
expect(ini_get('session.use_strict_mode') === '1');
session_destroy();
echo "PASS: production cookie flags and strict session mode.\n";
ob_end_flush();
