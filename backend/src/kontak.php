<?php
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';
require_once __DIR__ . '/../library/validation.php';
$method = $_SERVER['REQUEST_METHOD'];
$data = portfolioInput();
verifyToken($data->token ?? null);
$id = portfolioId($data->id ?? 0);
if ($method === 'GET') {
    echo json_encode(['status'=>'success','kontak_aktif'=>$conn->query('SELECT * FROM kontak_aktif ORDER BY created_at ASC,id ASC')->fetch_all(MYSQLI_ASSOC)]);
} elseif ($method === 'DELETE') {
    if ($id <= 0) portfolioError(400,'ID kontak tidak valid.');
    $stmt=$conn->prepare('DELETE FROM kontak_aktif WHERE id=? LIMIT 1');
    $stmt->bind_param('i',$id); $stmt->execute();
    if (!$stmt->affected_rows) portfolioError(404,'Kontak tidak ditemukan.');
    echo json_encode(['status'=>'success','message'=>'Kontak dihapus.']);
} elseif (in_array($method,['POST','PUT'],true)) {
    try {
        $name=portfolioText($data->nama_media ?? '',255);
        $url=portfolioContactUrl($data->url ?? '');
        if ($name === '' || $url === '') throw new InvalidArgumentException('Nama media dan URL wajib diisi.');
        if ($method === 'POST') {
            $stmt=$conn->prepare('INSERT INTO kontak_aktif (nama_media,url) VALUES (?,?)');
            $stmt->bind_param('ss',$name,$url);
        } else {
            if ($id <= 0) throw new InvalidArgumentException('ID kontak tidak valid.');
            $check=$conn->prepare('SELECT id FROM kontak_aktif WHERE id=?'); $check->bind_param('i',$id); $check->execute();
            if (!$check->get_result()->num_rows) portfolioError(404,'Kontak tidak ditemukan.');
            $stmt=$conn->prepare('UPDATE kontak_aktif SET nama_media=?,url=? WHERE id=? LIMIT 1');
            $stmt->bind_param('ssi',$name,$url,$id);
        }
        $stmt->execute();
        echo json_encode(['status'=>'success','message'=>'Kontak disimpan.','id'=>$method === 'POST' ? $conn->insert_id : $id]);
    } catch (InvalidArgumentException $e) { portfolioError(400,$e->getMessage()); }
} else portfolioError(405,'Method tidak diizinkan.');
