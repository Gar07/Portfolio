<?php
function executeQuery($query, $message = '')
{
    global $conn;
    $conn->query($query);
    if ($message) echo " [OK] $message\n";
}

function portfolioSession(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) return;
    global $config;
    require_once __DIR__ . '/config.php';
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_name('portfolio_session');
    session_set_cookie_params(['lifetime'=>0, 'path'=>'/api', 'secure'=>$config['environment'] === 'production', 'httponly'=>true, 'samesite'=>'Strict']);
    session_start();
}

function portfolioError(int $status, string $message): never
{
    http_response_code($status);
    echo json_encode(['status'=>'error', 'message'=>$message]);
    exit;
}

// token is a CSRF value, not the credential. Authentication lives in HttpOnly PHP cookies.
function verifyToken($token = null): int
{
    portfolioSession();
    $now = time();
    if (empty($_SESSION['user_id']) || $now - ($_SESSION['last_seen'] ?? 0) > 1800 || $now - ($_SESSION['created'] ?? 0) > 28800) {
        $_SESSION = [];
        portfolioError(401, 'Sesi berakhir. Silakan masuk kembali.');
    }
    if (!in_array($_SERVER['REQUEST_METHOD'] ?? 'GET', ['GET','HEAD'], true)) {
        $csrf = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? $token;
        if (!is_string($csrf) || !hash_equals($_SESSION['csrf'], $csrf)) portfolioError(403, 'Verifikasi permintaan gagal. Muat ulang halaman.');
    }
    global $conn;
    $id = (int) $_SESSION['user_id'];
    $stmt = $conn->prepare('SELECT password FROM users WHERE id=?');
    $stmt->bind_param('i', $id); $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    if (!$row || !hash_equals($_SESSION['password_version'], hash('sha256', $row['password']))) {
        $_SESSION = [];
        portfolioError(401, 'Sesi tidak berlaku. Silakan masuk kembali.');
    }
    $_SESSION['last_seen'] = $now;
    return $id;
}

function portfolioInput(): object
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') return (object) $_GET;
    if (str_starts_with($_SERVER['CONTENT_TYPE'] ?? '', 'multipart/form-data')) return (object) $_POST;
    try { $data = json_decode(file_get_contents('php://input'), false, 32, JSON_THROW_ON_ERROR); }
    catch (JsonException $e) { portfolioError(400, 'Body harus berupa objek JSON yang valid.'); }
    if (!is_object($data)) portfolioError(400, 'Body harus berupa objek JSON.');
    return $data;
}
