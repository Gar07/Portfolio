<?php
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';
require_once __DIR__ . '/../library/validation.php';
$method=$_SERVER['REQUEST_METHOD'];
$data=portfolioInput();
verifyToken($data->token ?? null);
$id=portfolioId($data->id ?? 0);
if ($method === 'GET') {
    echo json_encode(['status'=>'success','keahlian'=>$conn->query('SELECT * FROM keahlian ORDER BY id DESC')->fetch_all(MYSQLI_ASSOC)]);
} elseif ($method === 'DELETE') {
    if ($id <= 0) portfolioError(400,'ID keahlian tidak valid.');
    $stmt=$conn->prepare('DELETE FROM keahlian WHERE id=? LIMIT 1'); $stmt->bind_param('i',$id); $stmt->execute();
    if (!$stmt->affected_rows) portfolioError(404,'Keahlian tidak ditemukan.');
    echo json_encode(['status'=>'success','message'=>'Keahlian dihapus.']);
} elseif (in_array($method,['POST','PUT'],true)) {
    try {
        if ($method === 'PUT') {
            $stmt=$conn->prepare('SELECT * FROM keahlian WHERE id=?'); $stmt->bind_param('i',$id); $stmt->execute();
            $old=$stmt->get_result()->fetch_assoc();
            if (!$old) portfolioError(404,'Keahlian tidak ditemukan.');
            $data=(object)array_replace($old,(array)$data);
        }
        $name=portfolioText($data->nama_keahlian ?? '',255); $level=portfolioText($data->level ?? '',40);
        $category=portfolioText($data->kategori ?? 'Lainnya',80) ?: 'Lainnya';
        if ($name === '') throw new InvalidArgumentException('Nama keahlian wajib diisi.');
        if (!in_array($level,['','Beginner','Intermediate','Advanced','Expert'],true)) throw new InvalidArgumentException('Level keahlian tidak valid.');
        if ($method === 'POST') {
            $stmt=$conn->prepare('INSERT INTO keahlian (nama_keahlian,level,kategori) VALUES (?,?,?)'); $stmt->bind_param('sss',$name,$level,$category);
        } else {
            $stmt=$conn->prepare('UPDATE keahlian SET nama_keahlian=?,level=?,kategori=? WHERE id=?'); $stmt->bind_param('sssi',$name,$level,$category,$id);
        }
        $stmt->execute();
        echo json_encode(['status'=>'success','message'=>'Keahlian disimpan.','id'=>$method === 'POST' ? $conn->insert_id : $id]);
    } catch (InvalidArgumentException $e) { portfolioError(400,$e->getMessage()); }
} else portfolioError(405,'Method tidak diizinkan.');
