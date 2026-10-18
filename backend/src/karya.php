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
        $result = $conn->query('SELECT * FROM karya_terbaik ORDER BY unggulan DESC,tahun DESC,id DESC');
        echo json_encode(['status' => 'success', 'karya_terbaik' => $result->fetch_all(MYSQLI_ASSOC)]);
    } elseif ($method === 'DELETE') {
        if ($id <= 0) throw new InvalidArgumentException('ID proyek tidak valid.');
        $stmt = $conn->prepare('DELETE FROM karya_terbaik WHERE id=? LIMIT 1');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        echo json_encode(['status' => 'success', 'message' => 'Proyek dihapus.']);
    } elseif (in_array($method, ['POST','PUT'], true)) {
        if ($method === 'PUT') {
            $stmt = $conn->prepare('SELECT * FROM karya_terbaik WHERE id=?');
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $old = $stmt->get_result()->fetch_assoc();
            if (!$old) { http_response_code(404); echo json_encode(['status'=>'error','message'=>'Proyek tidak ditemukan.']); exit; }
            $data = (object) array_replace($old, (array) $data);
        }
        $name = portfolioText($data->nama_karya ?? '', 255);
        $description = portfolioText($data->deskripsi ?? '', 2000);
        if ($name === '' || $description === '') throw new InvalidArgumentException('Nama dan deskripsi proyek wajib diisi.');
        $url = portfolioUrl($data->url ?? '');
        $demo = portfolioUrl($data->demo_url ?? '');
        $technology = portfolioText($data->teknologi ?? '', 500);
        $role = portfolioText($data->peran ?? '', 300);
        $case = portfolioText($data->studi_kasus ?? '', 5000);
        $year = portfolioYear($data->tahun ?? 0);
        $featured = filter_var($data->unggulan ?? 0, FILTER_VALIDATE_INT);
        if (!in_array($featured, [0,1], true)) throw new InvalidArgumentException('Pilihan unggulan tidak valid.');
        if ($method === 'POST') {
            $stmt = $conn->prepare('INSERT INTO karya_terbaik (nama_karya,deskripsi,url,demo_url,teknologi,peran,studi_kasus,tahun,unggulan) VALUES (?,?,?,?,?,?,?,?,?)');
            $stmt->bind_param('sssssssii', $name,$description,$url,$demo,$technology,$role,$case,$year,$featured);
        } else {
            $stmt = $conn->prepare('UPDATE karya_terbaik SET nama_karya=?,deskripsi=?,url=?,demo_url=?,teknologi=?,peran=?,studi_kasus=?,tahun=?,unggulan=? WHERE id=?');
            $stmt->bind_param('sssssssiii', $name,$description,$url,$demo,$technology,$role,$case,$year,$featured,$id);
        }
        $stmt->execute();
        echo json_encode(['status'=>'success','message'=>'Proyek disimpan.','id'=>$method === 'POST' ? $conn->insert_id : $id]);
    } else {
        http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method tidak diizinkan.']);
    }
} catch (InvalidArgumentException $e) {
    http_response_code(400); echo json_encode(['status'=>'error','message'=>$e->getMessage()]);
} catch (Throwable $e) {
    http_response_code(500); echo json_encode(['status'=>'error','message'=>'Data proyek tidak dapat diproses.']);
}
$conn->close();
