<?php
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
$root=dirname(__DIR__);
$config=require $root . '/config.local.php';
if ($config['environment'] !== 'local') throw new RuntimeException('Tests require a local database account, never production.');
[$script,$action,$name,$directory]=$argv;
if (!preg_match('/^portfolio_test_[a-f0-9]{12}$/D',$name)) throw new RuntimeException('Unsafe test database name.');
$conn=new mysqli($config['db_host'],$config['db_user'],$config['db_password'],'',(int)($config['db_port'] ?? 3306));
if ($action === 'create') {
    $conn->query("CREATE DATABASE `$name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $config['db_name']=$name; $config['origin']='http://localhost:18081';
    file_put_contents($directory . '/config.local.php',"<?php\nreturn " . var_export($config,true) . ";\n");
} elseif ($action === 'drop') {
    $conn->query("DROP DATABASE `$name`");
} else throw new RuntimeException('Unsupported action.');
