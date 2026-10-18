<?php
ini_set('display_errors', '0');
set_exception_handler(function (Throwable $error): void {
    $invalid = $error instanceof InvalidArgumentException;
    if (!$invalid) error_log((string) $error);
    http_response_code($invalid ? 400 : 500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status'=>'error','message'=>$invalid ? $error->getMessage() : 'Layanan tidak dapat memproses permintaan. Periksa log server.']);
});
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 12 * 1024 * 1024) {
    http_response_code(413); header('Content-Type: application/json');
    echo json_encode(['status'=>'error','message'=>'Ukuran permintaan terlalu besar. Maksimal 5 MB per berkas.']); exit;
}

// Selalu sertakan CORS header di awal agar preflight OPTIONS bekerja di seluruh endpoint
require_once __DIR__ . '/library/cors.php';

// 1. Ambil path dari URL yang diminta klien
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = trim((string)$requestUri, '/');
$path = preg_replace('~^api(?:/|$)~', '', $path);

// 2. PENANGANAN BERKAS STATIS (Contoh: Gambar di folder uploads/)
$staticFile = __DIR__ . '/' . $path;
if (preg_match('~^uploads/[a-zA-Z0-9_-]+\.(png|jpe?g|webp|pdf)$~i', $path) && is_file($staticFile)) {
    // Deteksi tipe konten (image/png, image/jpeg, dll)
    $mime = mime_content_type($staticFile);
    header('Content-Type: ' . ($mime ?: 'application/octet-stream'));
    header('X-Content-Type-Options: nosniff');
    if (strtolower(pathinfo($staticFile, PATHINFO_EXTENSION)) === 'pdf') header('Content-Disposition: attachment; filename="CV-Portofolio.pdf"');
    header('Cache-Control: public, max-age=86400');
    readfile($staticFile);
    exit;
}

// 3. SET DEFAULT HEADER API: JSON
header('Content-Type: application/json');

// Jika mengakses root '/'
if (empty($path)) {
    echo json_encode([
        'status' => 'success',
        'message' => 'Selamat datang di backend REST API portofolio'
    ]);
    exit;
}

// 4. ROUTING DINAMIS KE FOLDER src/
$safePath = preg_match('/^[a-z_]+$/', $path) ? $path : '';
$filePath = __DIR__ . '/src/' . $safePath . '.php';

if (file_exists($filePath)) {
    require_once $filePath;
} else {
    // Jika endpoint tidak ditemukan
    http_response_code(404);
    echo json_encode([
        'status' => 'error',
        'error' => 'Endpoint tidak ditemukan'
    ]);
}
