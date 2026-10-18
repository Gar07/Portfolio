<?php
// A strict file allowlist prevents local secrets, dumps and uploads entering a release.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
$root=dirname(__DIR__);
if (!extension_loaded('zip')) throw new RuntimeException('Aktifkan ekstensi PHP zip.');
if (!is_file("$root/frontend/dist/index.html")) throw new RuntimeException('Jalankan npm run build terlebih dahulu.');
$out="$root/release";
if (!is_dir($out)) mkdir($out,0755,true);
$zip=new ZipArchive();
if ($zip->open("$out/portfolio-hostinger.zip",ZipArchive::CREATE|ZipArchive::OVERWRITE) !== true) throw new RuntimeException('ZIP tidak dapat dibuat.');
$addTree=function(string $source,string $target) use ($zip): void {
    $iterator=new RecursiveIteratorIterator(new RecursiveDirectoryIterator($source,FilesystemIterator::SKIP_DOTS));
    foreach ($iterator as $file) {
        $relative=str_replace('\\','/',substr($file->getPathname(),strlen($source)+1));
        if ($file->isLink()) throw new RuntimeException('Symlink tidak boleh masuk rilis.');
        $zip->addFile($file->getPathname(),"$target/$relative");
    }
};
$addTree("$root/frontend/dist",'public_html');
foreach (['library','src','migration'] as $dir) $addTree("$root/backend/$dir","portfolio-private/backend/$dir");
$zip->addFile("$root/backend/index.php",'portfolio-private/backend/index.php');
foreach (['default.png','cv-gilbert-2026.pdf'] as $name) $zip->addFile("$root/backend/uploads/$name","portfolio-private/backend/uploads/$name");
$zip->addFile("$root/deploy/public.htaccess",'public_html/.htaccess');
$zip->addFile("$root/deploy/private.htaccess",'portfolio-private/.htaccess');
$zip->addFile("$root/deploy/api-index.php",'public_html/api/index.php');
$zip->addFile("$root/config.example.php",'portfolio-private/config.example.php');
$zip->addFile("$root/scripts/admin-password.php",'portfolio-private/admin-password.php');
$zip->addFile("$root/HOSTINGER.md",'HOSTINGER.md');
if (!$zip->close()) throw new RuntimeException('ZIP gagal disimpan.');
file_put_contents("$out/SHA256SUMS.txt",hash_file('sha256',"$out/portfolio-hostinger.zip") . "  portfolio-hostinger.zip\n");
echo "Rilis: release/portfolio-hostinger.zip\nSHA-256: " . hash_file('sha256',"$out/portfolio-hostinger.zip") . "\n";
