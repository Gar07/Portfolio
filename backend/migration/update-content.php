<?php
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/schema.php';
$seed = require __DIR__ . '/profile-data.php';
upgradePortfolioSchema($conn);
$conn->begin_transaction();
try {
    $conn->query("INSERT IGNORE INTO portfolio_migrations (name) VALUES ('2026-10-18-student-profile')");
    if ($conn->affected_rows === 0) {
        $conn->rollback();
        echo "Konten sudah diperbarui; perubahan melalui admin tetap dipertahankan.\n";
        exit;
    }
    $usersBefore = $conn->query('SELECT * FROM users ORDER BY created_at,id FOR UPDATE')->fetch_all(MYSQLI_ASSOC);
    if (!$usersBefore) throw new RuntimeException('Jalankan main.php untuk instalasi pertama.');
    $user = $usersBefore[0];
    $profile = array_intersect_key($seed['profil'], array_flip(['nama_lengkap','nama_panggilan','domisili','fokus','minat']));
    if ($user['bio'] === '' || $user['bio'] === 'Belajar membangun hal yang berguna. Saya tertarik pada pengembangan web, AI, dan keamanan siber.') $profile['bio'] = $seed['profil']['bio'];
    if ($user['cv'] === '' && is_file(__DIR__ . '/../uploads/' . $seed['profil']['cv'])) $profile['cv'] = $seed['profil']['cv'];
    $assignments = implode(',', array_map(fn($key) => "`$key`=?", array_keys($profile)));
    $values = [...array_values($profile), $user['id']];
    $stmt = $conn->prepare("UPDATE users SET $assignments WHERE id=?");
    $stmt->bind_param(str_repeat('s', count($values)), ...$values);
    $stmt->execute();
    $stmt->close();

    $identities = ['riwayat_pendidikan' => ['nama_institusi'], 'pengalaman' => ['nama_perusahaan','jabatan'],
        'keahlian' => ['nama_keahlian'], 'karya_terbaik' => ['nama_karya'], 'kontak_aktif' => ['url'], 'pencapaian' => ['nama','penyelenggara']];
    $levelsBefore = $conn->query('SELECT id, level FROM keahlian ORDER BY id')->fetch_all(MYSQLI_ASSOC);
    foreach ($identities as $table => $keys) {
        foreach ($seed[$table] as $row) {
            $identity = $table === 'karya_terbaik' && $row['url'] !== '' ? ['url'] : $keys;
            $where = implode(' AND ', array_map(fn($key) => "`$key`=?", $identity));
            $params = array_map(fn($key) => $row[$key], $identity);
            $stmt = $conn->prepare("SELECT * FROM `$table` WHERE $where LIMIT 1 FOR UPDATE");
            $stmt->bind_param(str_repeat('s', count($params)), ...$params);
            $stmt->execute();
            $existing = $stmt->get_result()->fetch_assoc();
            $stmt->close();
            if (!$existing) { insertPortfolioRow($conn, $table, $row); continue; }
            if ($table === 'keahlian') unset($row['level']);
            foreach (['url','demo_url'] as $field) {
                if (isset($row[$field]) && $row[$field] === '' && ($existing[$field] ?? '') !== '') unset($row[$field]);
            }
            $set = implode(',', array_map(fn($key) => "`$key`=?", array_keys($row)));
            $params = [...array_values($row), $existing['id']];
            $stmt = $conn->prepare("UPDATE `$table` SET $set WHERE id=?");
            $stmt->bind_param(str_repeat('s', count($params)), ...$params);
            $stmt->execute();
            $stmt->close();
        }
    }
    $afterLevels = array_column($conn->query('SELECT id,level FROM keahlian')->fetch_all(MYSQLI_ASSOC), 'level', 'id');
    foreach ($levelsBefore as $row) if ($afterLevels[$row['id']] !== $row['level']) throw new RuntimeException('Level lama berubah.');
    $usersAfter = $conn->query('SELECT * FROM users ORDER BY created_at,id')->fetch_all(MYSQLI_ASSOC);
    foreach ($usersBefore as $i => $before) {
        $after = $usersAfter[$i];
        if ($i === 0) foreach (array_keys($profile) as $field) unset($before[$field], $after[$field]);
        if ($before !== $after) throw new RuntimeException('Akun, kredensial, atau profil lain berubah.');
    }
    $conn->commit();
    echo "PASS: konten mahasiswa diperbarui; akun, level lama, dan baris tambahan dipertahankan.\n";
} catch (Throwable $error) {
    $conn->rollback();
    fwrite(STDERR, $error->getMessage() . "\n");
    exit(1);
}
