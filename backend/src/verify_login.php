<?php
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';
if ($_SERVER['REQUEST_METHOD'] !== 'GET') portfolioError(405, 'Hanya metode GET yang diterima.');
$id = verifyToken();
$stmt = $conn->prepare('SELECT id,username,email,nama_lengkap,bio,nomor_hp,foto FROM users WHERE id=? LIMIT 1');
$stmt->bind_param('i',$id); $stmt->execute();
echo json_encode(['status'=>'success','user'=>$stmt->get_result()->fetch_assoc(),'token'=>$_SESSION['csrf']]);
