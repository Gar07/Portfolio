<?php
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') portfolioError(405, 'Hanya metode POST yang diterima.');
$data = portfolioInput();
verifyToken($data->token ?? null);
$_SESSION = [];
$params = session_get_cookie_params();
setcookie(session_name(), '', ['expires'=>1,'path'=>$params['path'],'secure'=>$params['secure'],'httponly'=>true,'samesite'=>'Strict']);
session_destroy();
echo json_encode(['status'=>'success','message'=>'Sesi diakhiri.']);
