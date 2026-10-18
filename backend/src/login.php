<?php
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';
require_once __DIR__ . '/../library/validation.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') portfolioError(405, 'Hanya metode POST yang diterima.');
if (isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] !== $config['origin']) portfolioError(403, 'Origin tidak diizinkan.');
$data = portfolioInput();
try {
    $username = portfolioText($data->username ?? '', 255);
    $password = $data->password ?? '';
    if (!is_string($password) || $password === '' || strlen($password) > 1000 || $username === '') throw new InvalidArgumentException('Username dan password wajib diisi.');
} catch (InvalidArgumentException $e) { portfolioError(400, $e->getMessage()); }
$key = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
// Atomic counter shared by all PHP workers. Never trust a client-supplied forwarded IP.
$conn->query('DELETE FROM login_attempts WHERE started_at < UNIX_TIMESTAMP() - 86400');
$stmt = $conn->prepare('INSERT INTO login_attempts (client_key,attempts,started_at) VALUES (?,1,UNIX_TIMESTAMP()) ON DUPLICATE KEY UPDATE attempts=IF(started_at < UNIX_TIMESTAMP()-900,1,attempts+1), started_at=IF(started_at < UNIX_TIMESTAMP()-900,UNIX_TIMESTAMP(),started_at)');
$stmt->bind_param('s',$key); $stmt->execute();
$stmt = $conn->prepare('SELECT attempts,started_at FROM login_attempts WHERE client_key=?');
$stmt->bind_param('s',$key); $stmt->execute(); $attempt = $stmt->get_result()->fetch_assoc();
if ($attempt['attempts'] > 10) { header('Retry-After: ' . max(1, 900 - (time() - $attempt['started_at']))); portfolioError(429, 'Terlalu banyak percobaan. Coba lagi setelah 15 menit.'); }
$stmt = $conn->prepare('SELECT id,username,password,nama_lengkap,bio,email,foto FROM users WHERE username=? LIMIT 1');
$stmt->bind_param('s',$username); $stmt->execute(); $row = $stmt->get_result()->fetch_assoc();
// A valid dummy bcrypt hash keeps unknown usernames on the same verification path.
$hash = $row['password'] ?? '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.';
if (!password_verify($password, $hash) || !$row) portfolioError(401, 'Username atau password salah.');
if ($config['environment'] === 'production' && password_verify('admin123', $row['password'])) portfolioError(403, 'Ganti password demo melalui CLI sebelum login produksi.');
portfolioSession();
session_regenerate_id(true);
$_SESSION = ['user_id'=>(int)$row['id'], 'csrf'=>bin2hex(random_bytes(32)), 'created'=>time(), 'last_seen'=>time(), 'password_version'=>hash('sha256',$row['password'])];
unset($row['password']);
echo json_encode(['status'=>'success','user'=>$row,'token'=>$_SESSION['csrf']]);
