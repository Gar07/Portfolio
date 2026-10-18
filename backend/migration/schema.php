<?php
function upgradePortfolioSchema(mysqli $conn): void
{
    $columns = [
        'users' => ['nama_panggilan' => "VARCHAR(80) NOT NULL DEFAULT ''", 'domisili' => "VARCHAR(160) NOT NULL DEFAULT ''", 'fokus' => "VARCHAR(500) NOT NULL DEFAULT ''", 'minat' => "VARCHAR(500) NOT NULL DEFAULT ''", 'cv' => "VARCHAR(255) NOT NULL DEFAULT ''"],
        'karya_terbaik' => ['teknologi' => "VARCHAR(500) NOT NULL DEFAULT ''", 'demo_url' => "VARCHAR(1000) NOT NULL DEFAULT ''", 'peran' => "VARCHAR(300) NOT NULL DEFAULT ''", 'studi_kasus' => 'TEXT NULL', 'unggulan' => 'TINYINT NOT NULL DEFAULT 0', 'tahun' => 'INT NOT NULL DEFAULT 0'],
        'pengalaman' => ['periode' => "VARCHAR(80) NOT NULL DEFAULT ''", 'deskripsi' => 'TEXT NULL'],
        'keahlian' => ['kategori' => "VARCHAR(80) NOT NULL DEFAULT 'Lainnya'"],
    ];
    foreach ($columns as $table => $fields) {
        $existing = array_column($conn->query("SHOW COLUMNS FROM `$table`")->fetch_all(MYSQLI_ASSOC), 'Field');
        foreach ($fields as $name => $definition) {
            if (!in_array($name, $existing, true)) $conn->query("ALTER TABLE `$table` ADD COLUMN `$name` $definition");
        }
    }
    $urlColumn = $conn->query("SHOW COLUMNS FROM karya_terbaik LIKE 'url'")->fetch_assoc();
    if ($urlColumn['Type'] === 'varchar(255)') $conn->query("ALTER TABLE karya_terbaik MODIFY url VARCHAR(1000) NOT NULL");
    $conn->query("CREATE TABLE IF NOT EXISTS pencapaian (
        id INT AUTO_INCREMENT PRIMARY KEY, nama VARCHAR(255) NOT NULL,
        penyelenggara VARCHAR(255) NOT NULL, jenis VARCHAR(40) NOT NULL,
        tahun INT NOT NULL DEFAULT 0, periode VARCHAR(80) NOT NULL DEFAULT '',
        deskripsi TEXT NOT NULL, url VARCHAR(1000) NOT NULL DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    $conn->query('CREATE TABLE IF NOT EXISTS portfolio_migrations (name VARCHAR(100) PRIMARY KEY, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
    $conn->query('CREATE TABLE IF NOT EXISTS login_attempts (client_key CHAR(64) PRIMARY KEY, attempts INT NOT NULL, started_at BIGINT NOT NULL, INDEX (started_at))');
    $usernameIndex=$conn->query("SHOW INDEX FROM users WHERE Key_name='users_username_unique'");
    if ($usernameIndex->num_rows === 0) {
        if ($conn->query('SELECT username FROM users GROUP BY username HAVING COUNT(*) > 1 LIMIT 1')->num_rows) throw new RuntimeException('Username duplikat perlu diselesaikan sebelum membuat index unik. Akun tidak dihapus.');
        $conn->query('CREATE UNIQUE INDEX users_username_unique ON users (username)');
    }
    $contactUrl = $conn->query("SHOW COLUMNS FROM kontak_aktif LIKE 'url'")->fetch_assoc();
    if ($contactUrl['Type'] === 'varchar(255)') $conn->query('ALTER TABLE kontak_aktif MODIFY url VARCHAR(1000) NOT NULL');
}
function insertPortfolioRow(mysqli $conn, string $table, array $row): void
{
    $fields = '`' . implode('`,`', array_keys($row)) . '`';
    $marks = implode(',', array_fill(0, count($row), '?'));
    $values = array_values($row);
    $stmt = $conn->prepare("INSERT INTO `$table` ($fields) VALUES ($marks)");
    $stmt->bind_param(str_repeat('s', count($values)), ...$values);
    $stmt->execute();
    $stmt->close();
}
