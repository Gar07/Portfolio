<?php
require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';
require_once __DIR__ . '/../library/validation.php';
$method = $_SERVER['REQUEST_METHOD'];
$data = portfolioInput();
$userId = verifyToken($data->token ?? null);
$id = portfolioId($data->id ?? 0);
try {
    if ($method === 'GET') {
        echo json_encode(['status'=>'success','pencapaian'=>$conn->query('SELECT * FROM pencapaian ORDER BY tahun DESC,id DESC')->fetch_all(MYSQLI_ASSOC)]);
    } elseif ($method === 'DELETE') {
        if ($id <= 0) throw new InvalidArgumentException('ID pencapaian tidak valid.');
        $stmt=$conn->prepare('DELETE FROM pencapaian WHERE id=? LIMIT 1');
        $stmt->bind_param('i',$id); $stmt->execute();
        echo json_encode(['status'=>'success','message'=>'Pencapaian dihapus.']);
    } elseif (in_array($method,['POST','PUT'],true)) {
        if ($method === 'PUT') {
            $stmt=$conn->prepare('SELECT * FROM pencapaian WHERE id=?'); $stmt->bind_param('i',$id); $stmt->execute();
            $old=$stmt->get_result()->fetch_assoc();
            if (!$old) { http_response_code(404); echo json_encode(['status'=>'error','message'=>'Pencapaian tidak ditemukan.']); exit; }
            $data=(object)array_replace($old,(array)$data);
        }
        $name=portfolioText($data->nama ?? '',255); $organizer=portfolioText($data->penyelenggara ?? '',255);
        $type=portfolioText($data->jenis ?? '',40); $year=portfolioYear($data->tahun ?? 0);
        $period=portfolioText($data->periode ?? '',80); $description=portfolioText($data->deskripsi ?? '',3000);
        $url=portfolioUrl($data->url ?? '');
        if ($name === '' || $organizer === '') throw new InvalidArgumentException('Nama dan penyelenggara wajib diisi.');
        if (!in_array($type,['Prestasi','Sertifikasi','Kegiatan'],true)) throw new InvalidArgumentException('Jenis pencapaian tidak valid.');
        if ($method === 'POST') {
            $stmt=$conn->prepare('INSERT INTO pencapaian (nama,penyelenggara,jenis,tahun,periode,deskripsi,url) VALUES (?,?,?,?,?,?,?)');
            $stmt->bind_param('sssisss',$name,$organizer,$type,$year,$period,$description,$url);
        } else {
            $stmt=$conn->prepare('UPDATE pencapaian SET nama=?,penyelenggara=?,jenis=?,tahun=?,periode=?,deskripsi=?,url=? WHERE id=?');
            $stmt->bind_param('sssisssi',$name,$organizer,$type,$year,$period,$description,$url,$id);
        }
        $stmt->execute();
        echo json_encode(['status'=>'success','message'=>'Pencapaian disimpan.','id'=>$method === 'POST' ? $conn->insert_id : $id]);
    } else { http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method tidak diizinkan.']); }
} catch (InvalidArgumentException $e) { http_response_code(400); echo json_encode(['status'=>'error','message'=>$e->getMessage()]);
} catch (Throwable $e) { http_response_code(500); echo json_encode(['status'=>'error','message'=>'Pencapaian tidak dapat diproses.']); }
$conn->close();
