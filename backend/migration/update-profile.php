<?php
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require_once __DIR__ . '/../library/dbconnection.php';
$target = require __DIR__ . '/profile-data.php';
$legacy = [
    'riwayat_pendidikan' => [
    ['Universitas Indonesia', 'S2', 'Magister Ilmu Komputer', 2019, 2021],
    ['Institut Teknologi Bandung', 'S1', 'Teknik Informatika', 2014, 2018],
    ['SMA Negeri 1 Jakarta', 'SMA', 'IPA', 2011, 2014]
],
    'pengalaman' => [
    ['Tech Global Inovasi', 'Senior Full Stack Engineer', 2022, 2026],
    ['Digital Solusindo Nusantara', 'Full Stack Web Developer', 2020, 2022],
    ['Kreatif Studio Media', 'Junior Frontend Developer', 2018, 2020]
],
    'keahlian' => [
    ['React 19 & Next.js', 'Advanced'],
    ['PHP 8+ & Laravel', 'Advanced'],
    ['TypeScript & JavaScript', 'Advanced'],
    ['MySQL & PostgreSQL', 'Intermediate'],
    ['RESTful API & GraphQL', 'Advanced'],
    ['Tailwind CSS & Modern UI', 'Expert'],
    ['Git & CI/CD DevOps', 'Intermediate'],
    ['UI/UX Design & Figma', 'Intermediate']
],
    'karya_terbaik' => [
    [
        'Sistem E-Commerce Terintegrasi Payment Gateway',
        'Platform belanja online modern dengan dashboard analytics, inventaris otomatis, dan integrasi Midtrans.',
        'https://github.com/example/ecommerce-app'
    ],
    [
        'Aplikasi Manajemen Proyek & Tugas Tim (TaskFlow)',
        'Aplikasi kolaboratif dengan kanban board real-time, manajemen sprint, dan notifikasi cerdas.',
        'https://github.com/example/taskflow-pro'
    ],
    [
        'Sistem Smart Portal Rumah Sakit & Rekam Medis',
        'Sistem informasi manajemen klinik terintegrasi BPJS dengan sistem antrean online dan rekam medis elektronik.',
        'https://github.com/example/hospital-emr'
    ],
    [
        'Modern Portfolio & Content Management Dashboard',
        'Website portofolio interaktif dengan dark/light theme, REST API native PHP, dan admin dashboard modern.',
        'https://github.com/example/modern-portfolio'
    ]
],
    'kontak_aktif' => [
    ['Email', 'mailto:admin@example.com'],
    ['GitHub', 'https://github.com/portfolio-admin'],
    ['LinkedIn', 'https://linkedin.com/in/insan-taufik'],
    ['WhatsApp', 'https://wa.me/6281234567890'],
    ['Instagram', 'https://instagram.com/insan_taufik']
]
];
$columns = [
    'riwayat_pendidikan' => ['nama_institusi', 'tingkat', 'jurusan', 'tahun_mulai', 'tahun_selesai'],
    'pengalaman' => ['nama_perusahaan', 'jabatan', 'tahun_mulai', 'tahun_selesai'],
    'keahlian' => ['nama_keahlian', 'level'],
    'karya_terbaik' => ['nama_karya', 'deskripsi', 'url'],
    'kontak_aktif' => ['nama_media', 'url'],
];
$conn->begin_transaction();
try {
    $usersBefore = $conn->query('SELECT * FROM users ORDER BY created_at, id FOR UPDATE')->fetch_all(MYSQLI_ASSOC);
    if (!$usersBefore) throw new RuntimeException('Jalankan main.php untuk instalasi pertama.');
    $user = $usersBefore[0];
    $profile = $target['profil'];
    $phone = $user['nomor_hp'] === '081234567890' ? '' : $user['nomor_hp'];
    $photo = $user['foto'] === 'default.png' ? $profile['foto'] : $user['foto'];
    $stmt = $conn->prepare('UPDATE users SET nama_lengkap=?, email=?, nomor_hp=?, foto=? WHERE id=?');
    $stmt->bind_param('ssssi', $profile['nama_lengkap'], $profile['email'], $phone, $photo, $user['id']);
    $stmt->execute();
    $stmt->close();

    foreach ($columns as $table => $fields) {
        $before = $conn->query("SELECT * FROM `$table` FOR UPDATE")->fetch_all(MYSQLI_ASSOC);
        $kept = [];
        foreach ($before as $row) {
            $values = array_map(fn($field) => (string) $row[$field], $fields);
            $isSample = false;
            foreach ($legacy[$table] as $sample) {
                if ($values === array_map('strval', $sample)) { $isSample = true; break; }
            }
            if (!$isSample) { $kept[$row['id']] = $row; continue; }
            $stmt = $conn->prepare("DELETE FROM `$table` WHERE id=?");
            $stmt->bind_param('i', $row['id']);
            $stmt->execute();
            $stmt->close();
        }
        foreach ($target[$table] as $targetRow) {
            $values = array_map(fn($field) => $targetRow[$field], $fields);
            $identity = in_array($table, ['kontak_aktif', 'karya_terbaik'], true) && $targetRow['url'] !== '' ? 'url' : $fields[0];
            $key = $targetRow[$identity];
            $stmt = $conn->prepare("SELECT id FROM `$table` WHERE `$identity`=? LIMIT 1");
            $stmt->bind_param('s', $key);
            $stmt->execute();
            $exists = $stmt->get_result()->num_rows > 0;
            $stmt->close();
            if ($exists) continue;
            $names = implode(',', $fields);
            $marks = implode(',', array_fill(0, count($fields), '?'));
            $stmt = $conn->prepare("INSERT INTO `$table` ($names) VALUES ($marks)");
            $stmt->bind_param(str_repeat('s', count($values)), ...$values);
            $stmt->execute();
            $stmt->close();
        }
        $after = $conn->query("SELECT * FROM `$table`")->fetch_all(MYSQLI_ASSOC);
        $after = array_column($after, null, 'id');
        foreach ($kept as $id => $row) {
            if (($after[$id] ?? null) !== $row) throw new RuntimeException("Data lain berubah pada $table.");
        }
    }
    $usersAfter = $conn->query('SELECT * FROM users ORDER BY created_at, id')->fetch_all(MYSQLI_ASSOC);
    foreach ($usersBefore as $index => $row) {
        $after = $usersAfter[$index];
        if ($index === 0) {
            foreach (['nama_lengkap','email','nomor_hp','foto'] as $field) unset($row[$field], $after[$field]);
        }
        if ($row !== $after) throw new RuntimeException('Akun atau kredensial berubah.');
    }
    $conn->commit();
    echo "PASS: profil Gilbert diperbarui; akun dan data lain dipertahankan.\n";
} catch (Throwable $error) {
    $conn->rollback();
    fwrite(STDERR, $error->getMessage() . "\n");
    exit(1);
}
