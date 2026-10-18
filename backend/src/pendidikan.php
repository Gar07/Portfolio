<?php
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';
require_once __DIR__ . '/../library/validation.php';
$method=$_SERVER['REQUEST_METHOD'];
$data=portfolioInput();
verifyToken($data->token ?? null);
$id=portfolioId($data->id ?? 0);
if ($method === 'GET') {
    echo json_encode(['status'=>'success','riwayat_pendidikan'=>$conn->query('SELECT * FROM riwayat_pendidikan ORDER BY tahun_mulai DESC,id DESC')->fetch_all(MYSQLI_ASSOC)]);
} elseif ($method === 'DELETE') {
    if ($id <= 0) portfolioError(400,'ID pendidikan tidak valid.');
    $stmt=$conn->prepare('DELETE FROM riwayat_pendidikan WHERE id=? LIMIT 1'); $stmt->bind_param('i',$id); $stmt->execute();
    if (!$stmt->affected_rows) portfolioError(404,'Pendidikan tidak ditemukan.');
    echo json_encode(['status'=>'success','message'=>'Pendidikan dihapus.']);
} elseif (in_array($method,['POST','PUT'],true)) {
    try {
        if ($method === 'PUT') {
            $stmt=$conn->prepare('SELECT * FROM riwayat_pendidikan WHERE id=?'); $stmt->bind_param('i',$id); $stmt->execute();
            $old=$stmt->get_result()->fetch_assoc();
            if (!$old) portfolioError(404,'Pendidikan tidak ditemukan.');
            $data=(object)array_replace($old,(array)$data);
        }
        $institution=portfolioText($data->nama_institusi ?? '',255);
        $level=portfolioText($data->tingkat ?? '',255); $major=portfolioText($data->jurusan ?? '',255);
        $start=portfolioYear($data->tahun_mulai ?? 0); $end=portfolioYear($data->tahun_selesai ?? 0);
        if ($institution === '' || $level === '' || $major === '') throw new InvalidArgumentException('Institusi, tingkat, dan jurusan wajib diisi.');
        if ($start && $end && $end < $start) throw new InvalidArgumentException('Tahun selesai tidak boleh sebelum tahun mulai.');
        if ($method === 'POST') {
            $stmt=$conn->prepare('INSERT INTO riwayat_pendidikan (nama_institusi,tingkat,jurusan,tahun_mulai,tahun_selesai) VALUES (?,?,?,?,?)');
            $stmt->bind_param('sssii',$institution,$level,$major,$start,$end);
        } else {
            $stmt=$conn->prepare('UPDATE riwayat_pendidikan SET nama_institusi=?,tingkat=?,jurusan=?,tahun_mulai=?,tahun_selesai=? WHERE id=?');
            $stmt->bind_param('sssiii',$institution,$level,$major,$start,$end,$id);
        }
        $stmt->execute();
        echo json_encode(['status'=>'success','message'=>'Pendidikan disimpan.','id'=>$method === 'POST' ? $conn->insert_id : $id]);
    } catch (InvalidArgumentException $e) { portfolioError(400,$e->getMessage()); }
} else portfolioError(405,'Method tidak diizinkan.');
