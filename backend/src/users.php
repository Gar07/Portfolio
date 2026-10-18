<?php
require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';
require_once __DIR__ . '/../library/validation.php';
require_once __DIR__ . '/../library/uploads.php';
$method = $_SERVER['REQUEST_METHOD'];
if (!in_array($method,['GET','POST','PUT'],true)) { http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method tidak diizinkan.']); exit; }
$data = portfolioInput();
$userId = verifyToken($data->token ?? null);
$fields='id,username,email,nama_lengkap,bio,nama_panggilan,domisili,fokus,minat,cv,nomor_hp,foto,created_at';
$stmt=$conn->prepare("SELECT $fields FROM users WHERE id=? LIMIT 1");
$stmt->bind_param('i',$userId); $stmt->execute(); $current=$stmt->get_result()->fetch_assoc(); $stmt->close();
if ($method === 'GET') { echo json_encode(['status'=>'success','user'=>$current]); exit; }
$newFiles=[];
try {
    $username=portfolioText($data->username ?? '',255);
    $email=portfolioText($data->email ?? '',255);
    $name=portfolioText($data->nama_lengkap ?? '',255);
    $phone=portfolioText($data->nomor_hp ?? '',255);
    $password=$data->password ?? '';
    if (!is_string($password) || ($password !== '' && (strlen($password) < 12 || strlen($password) > 72))) throw new InvalidArgumentException('Password baru harus 12–72 byte.');
    if ($username === '' || $email === '' || $name === '') throw new InvalidArgumentException('Nama, username, dan email wajib diisi.');
    if (!filter_var($email,FILTER_VALIDATE_EMAIL)) throw new InvalidArgumentException('Alamat email tidak valid.');
    $profile=[];
    foreach (['bio'=>500,'nama_panggilan'=>80,'domisili'=>160,'fokus'=>500,'minat'=>500] as $field=>$limit) {
        $profile[$field]=portfolioText($data->$field ?? $current[$field],$limit);
    }
    $removeCv=$data->remove_cv ?? 0;
    if (!in_array($removeCv,[0,1,'0','1',false,true],true)) throw new InvalidArgumentException('Pilihan hapus CV tidak valid.');
    $duplicate=$conn->prepare('SELECT id FROM users WHERE username=? AND id<>? LIMIT 1');
    $duplicate->bind_param('si',$username,$userId); $duplicate->execute();
    if ($duplicate->get_result()->num_rows) throw new InvalidArgumentException('Username sudah digunakan.');
    $photo=savePortfolioUpload('foto',['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp'],$current['foto']);
    if ($photo !== $current['foto']) $newFiles[]=$photo;
    $cv=savePortfolioUpload('cv',['application/pdf'=>'pdf'],$removeCv ? '' : $current['cv']);
    if ($cv !== '' && $cv !== $current['cv']) $newFiles[]=$cv;
    $values=[$username,$email,$name,$phone,$profile['bio'],$profile['nama_panggilan'],$profile['domisili'],$profile['fokus'],$profile['minat'],$photo,$cv];
    $sql='UPDATE users SET username=?,email=?,nama_lengkap=?,nomor_hp=?,bio=?,nama_panggilan=?,domisili=?,fokus=?,minat=?,foto=?,cv=?';
    if ($password !== '') { $sql.=',password=?'; $newHash=password_hash($password,PASSWORD_DEFAULT); $values[]=$newHash; }
    $sql.=' WHERE id=? LIMIT 1'; $values[]=$userId;
    $stmt=$conn->prepare($sql); $stmt->bind_param(str_repeat('s',count($values)),...$values); $stmt->execute(); $stmt->close();
    $newFiles=[];
    if ($password !== '') { $_SESSION['password_version']=hash('sha256',$newHash); session_regenerate_id(true); }
    if ($photo !== $current['foto']) removePortfolioUpload($current['foto']);
    if ($cv !== $current['cv']) removePortfolioUpload($current['cv']);
    $stmt=$conn->prepare("SELECT $fields FROM users WHERE id=? LIMIT 1");
    $stmt->bind_param('i',$userId); $stmt->execute(); $updated=$stmt->get_result()->fetch_assoc();
    echo json_encode(['status'=>'success','message'=>'Profil diperbarui.','user'=>$updated]);
} catch (Throwable $error) {
    foreach ($newFiles as $file) removePortfolioUpload($file);
    $status=$error instanceof LengthException ? 413 : ($error instanceof InvalidArgumentException ? 400 : 500);
    http_response_code($status);
    echo json_encode(['status'=>'error','message'=>$status === 500 ? 'Profil tidak dapat disimpan.' : $error->getMessage()]);
}
$conn->close();
