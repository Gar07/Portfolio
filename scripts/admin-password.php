<?php
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
// Works in the source repository and in portfolio-private on the host.
$root=is_dir(__DIR__ . '/backend') ? __DIR__ : dirname(__DIR__);
require $root . '/backend/library/dbconnection.php';
require $root . '/backend/library/validation.php';
$username=portfolioText(getenv('PORTFOLIO_ADMIN_USER') ?: '',255);
$password=getenv('PORTFOLIO_ADMIN_PASSWORD') ?: '';
if ($username === '' || strlen($password) < 12 || strlen($password) > 72) throw new RuntimeException('Isi PORTFOLIO_ADMIN_USER dan PORTFOLIO_ADMIN_PASSWORD (12–72 byte).');
$hash=password_hash($password,PASSWORD_DEFAULT);
$check=$conn->prepare('SELECT id FROM users WHERE username=?');
$check->bind_param('s',$username); $check->execute();
if ($check->get_result()->num_rows !== 1) throw new RuntimeException('Akun tidak ditemukan atau username tidak unik. Tidak ada perubahan.');
$stmt=$conn->prepare('UPDATE users SET password=?,token=NULL WHERE username=?');
$stmt->bind_param('ss',$hash,$username); $stmt->execute();
if ($stmt->affected_rows !== 1) throw new RuntimeException('Akun tidak ditemukan atau username tidak unik.');
echo "Password diperbarui; sesi lama otomatis tidak berlaku.\n";
