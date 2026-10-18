<?php
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';
require_once __DIR__ . '/../library/validation.php';
// Create the database first in hPanel (or local MySQL). Hosting users cannot CREATE DATABASE.

// 2. Tabel Users
$sql = 'CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(255) NOT NULL,
    bio VARCHAR(500) NOT NULL DEFAULT \'\',
    nomor_hp VARCHAR(255) NOT NULL,
    foto VARCHAR(255) NOT NULL,
    token VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)';
executeQuery($sql, 'Users Table Created');

// 3. Tabel Riwayat Pendidikan
$sql = 'CREATE TABLE IF NOT EXISTS riwayat_pendidikan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_institusi VARCHAR(255) NOT NULL,
    tingkat VARCHAR(255) NOT NULL,
    jurusan VARCHAR(255) NOT NULL,
    tahun_mulai INT NOT NULL,
    tahun_selesai INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)';
executeQuery($sql, 'Riwayat Pendidikan Table Created');

// 4. Tabel Pengalaman
$sql = 'CREATE TABLE IF NOT EXISTS pengalaman (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_perusahaan VARCHAR(255) NOT NULL,
    jabatan VARCHAR(255) NOT NULL,
    tahun_mulai INT NOT NULL,
    tahun_selesai INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)';
executeQuery($sql, 'Pengalaman Table Created');

// 5. Tabel Kontak Aktif
$sql = 'CREATE TABLE IF NOT EXISTS kontak_aktif (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_media VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)';
executeQuery($sql, 'Kontak Aktif Table Created');

// 6. Tabel Keahlian
$sql = 'CREATE TABLE IF NOT EXISTS keahlian (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_keahlian VARCHAR(255) NOT NULL,
    level VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)';
executeQuery($sql, 'Keahlian Table Created');

// 7. Tabel Karya Terbaik
$sql = 'CREATE TABLE IF NOT EXISTS karya_terbaik (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_karya VARCHAR(255) NOT NULL,
    deskripsi TEXT NOT NULL,
    url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)';
executeQuery($sql, 'Karya Terbaik Table Created');

$seed = require __DIR__ . '/profile-data.php';
require_once __DIR__ . '/schema.php';
// Migrasi tambahan untuk database lama; kolom dan data yang sudah ada tidak direset.
if ($conn->query("SHOW COLUMNS FROM users LIKE 'bio'")->num_rows === 0) {
    executeQuery("ALTER TABLE users ADD COLUMN bio VARCHAR(500) NOT NULL DEFAULT '' AFTER nama_lengkap", 'Bio Column Added');
    $stmt = $conn->prepare('UPDATE users SET bio=? ORDER BY created_at ASC, id ASC LIMIT 1');
    $stmt->bind_param('s', $seed['profil']['bio']);
    $stmt->execute();
    $stmt->close();
}

upgradePortfolioSchema($conn);
$conn->query('UPDATE users SET token=NULL WHERE token IS NOT NULL');
if ($conn->query('SELECT COUNT(*) FROM users')->fetch_row()[0] > 0) {
    echo "Skema terbaru; akun dan data yang sudah ada dipertahankan.\n";
    exit;
}
$conn->begin_transaction();
try {
    $profile = $seed['profil'];
    $username = portfolioText(getenv('PORTFOLIO_ADMIN_USER') ?: '', 255);
    $plainPassword = getenv('PORTFOLIO_ADMIN_PASSWORD') ?: '';
    if ($username === '' || strlen($username) > 255 || strlen($plainPassword) < 12 || strlen($plainPassword) > 72) throw new RuntimeException('Instalasi baru: isi PORTFOLIO_ADMIN_USER dan PORTFOLIO_ADMIN_PASSWORD (12–72 byte). Tidak ada akun default.');
    $password = password_hash($plainPassword, PASSWORD_DEFAULT);
    insertPortfolioRow($conn, 'users', ['username' => $username, 'password' => $password] + $profile);
    foreach (['riwayat_pendidikan','pengalaman','keahlian','karya_terbaik','kontak_aktif','pencapaian'] as $table) {
        if ($conn->query("SELECT COUNT(*) FROM `$table`")->fetch_row()[0] > 0) continue;
        foreach ($seed[$table] as $row) insertPortfolioRow($conn, $table, $row);
    }
    $conn->commit();
    echo "Instalasi selesai. Masuk dengan akun yang Anda tentukan.\n";
} catch (Throwable $error) {
    $conn->rollback();
    fwrite(STDERR, $error->getMessage() . "\n");
    exit(1);
}
