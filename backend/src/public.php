<?php
// backend/src/public.php
require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/dbconnection.php';
header('Content-Type: application/json');

// Hanya mengizinkan metode GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Endpoint public hanya menerima GET']);
    exit;
}

// Kumpulan query untuk tiap bagian portofolio
$queries = [
    'profil' => 'SELECT id, nama_lengkap, nama_panggilan, bio, domisili, fokus, minat, cv, email, nomor_hp, foto FROM users ORDER BY created_at ASC,id ASC LIMIT 1',
    'riwayat_pendidikan' => 'SELECT id, nama_institusi, tingkat, jurusan, tahun_mulai, tahun_selesai FROM riwayat_pendidikan ORDER BY tahun_mulai DESC, id DESC',
    'pengalaman' => 'SELECT id, nama_perusahaan, jabatan, tahun_mulai, tahun_selesai, periode, deskripsi FROM pengalaman ORDER BY tahun_mulai DESC, id DESC',
    'kontak_aktif' => 'SELECT id, nama_media, url FROM kontak_aktif ORDER BY created_at ASC',
    'keahlian' => 'SELECT id, nama_keahlian, level, kategori FROM keahlian ORDER BY created_at ASC',
    'karya_terbaik' => 'SELECT id, nama_karya, deskripsi, url, demo_url, teknologi, peran, studi_kasus, unggulan, tahun FROM karya_terbaik ORDER BY unggulan DESC,tahun DESC,id DESC',
    'pencapaian' => 'SELECT id, nama, penyelenggara, jenis, tahun, periode, deskripsi, url FROM pencapaian ORDER BY tahun DESC,id DESC'
];

$response = [
    'status' => 'success',
    'data' => []
];

// Eksekusi tiap query dan susun hasilnya ke dalam satu array respons
foreach ($queries as $key => $query) {
    $stmt = $conn->prepare($query);
    if (!$stmt || !$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Gagal mengambil data portofolio']);
        exit;
    }
    $result = $stmt->get_result();
    if ($key === 'profil') {
        $response['data'][$key] = $result->fetch_assoc() ?: null;
        if ($response['data'][$key] === null) {
            http_response_code(503);
            echo json_encode(['status'=>'error','message'=>'Portofolio belum diinisialisasi.']);
            exit;
        }
    } else {
        $response['data'][$key] = $result->fetch_all(MYSQLI_ASSOC) ?: [];
    }
    $stmt->close();
}

$conn->close();
echo json_encode($response);
