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
        echo json_encode(['status'=>'success','pengalaman'=>$conn->query('SELECT * FROM pengalaman ORDER BY tahun_mulai DESC,id DESC')->fetch_all(MYSQLI_ASSOC)]);
    } elseif ($method === 'DELETE') {
        if ($id <= 0) throw new InvalidArgumentException('ID pengalaman tidak valid.');
        $stmt=$conn->prepare('DELETE FROM pengalaman WHERE id=? LIMIT 1');
        $stmt->bind_param('i',$id); $stmt->execute();
        echo json_encode(['status'=>'success','message'=>'Pengalaman dihapus.']);
    } elseif (in_array($method,['POST','PUT'],true)) {
        if ($method === 'PUT') {
            $stmt=$conn->prepare('SELECT * FROM pengalaman WHERE id=?'); $stmt->bind_param('i',$id); $stmt->execute();
            $old=$stmt->get_result()->fetch_assoc();
            if (!$old) { http_response_code(404); echo json_encode(['status'=>'error','message'=>'Pengalaman tidak ditemukan.']); exit; }
            $data=(object)array_replace($old,(array)$data);
        }
        $company=portfolioText($data->nama_perusahaan ?? '',255);
        $role=portfolioText($data->jabatan ?? '',255);
        if ($company === '' || $role === '') throw new InvalidArgumentException('Organisasi dan peran wajib diisi.');
        $start=portfolioYear($data->tahun_mulai ?? 0); $end=portfolioYear($data->tahun_selesai ?? 0);
        if ($start && $end && $end < $start) throw new InvalidArgumentException('Tahun selesai tidak boleh sebelum tahun mulai.');
        $period=portfolioText($data->periode ?? '',80);
        $description=portfolioText($data->deskripsi ?? '',3000);
        if ($method === 'POST') {
            $stmt=$conn->prepare('INSERT INTO pengalaman (nama_perusahaan,jabatan,tahun_mulai,tahun_selesai,periode,deskripsi) VALUES (?,?,?,?,?,?)');
            $stmt->bind_param('ssiiss',$company,$role,$start,$end,$period,$description);
        } else {
            $stmt=$conn->prepare('UPDATE pengalaman SET nama_perusahaan=?,jabatan=?,tahun_mulai=?,tahun_selesai=?,periode=?,deskripsi=? WHERE id=?');
            $stmt->bind_param('ssiissi',$company,$role,$start,$end,$period,$description,$id);
        }
        $stmt->execute();
        echo json_encode(['status'=>'success','message'=>'Pengalaman disimpan.','id'=>$method === 'POST' ? $conn->insert_id : $id]);
    } else { http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method tidak diizinkan.']); }
} catch (InvalidArgumentException $e) { http_response_code(400); echo json_encode(['status'=>'error','message'=>$e->getMessage()]);
} catch (Throwable $e) { http_response_code(500); echo json_encode(['status'=>'error','message'=>'Pengalaman tidak dapat diproses.']); }
$conn->close();
