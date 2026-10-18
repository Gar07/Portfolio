<?php
require __DIR__ . '/../backend/tests/validation.php';
$zip=new ZipArchive();
expect($zip->open(__DIR__ . '/../release/portfolio-hostinger.zip') === true);
foreach (['public_html/index.html','public_html/.htaccess','public_html/api/index.php','portfolio-private/backend/index.php','portfolio-private/config.example.php','portfolio-private/backend/migration/main.php'] as $name) expect($zip->locateName($name) !== false);
for ($i=0;$i<$zip->numFiles;$i++) {
    $name=$zip->getNameIndex($i);
    expect(!preg_match('~(^|/)(config\.local\.php|node_modules|tests|\.git|\.env)(/|$)|\.sql$~',$name));
    if (str_starts_with($name,'public_html/')) expect(!str_contains($name,'backend/') && !str_contains($name,'migration/') && !str_contains($name,'config.'));
    if (str_starts_with($name,'portfolio-private/backend/uploads/')) expect(in_array(basename($name),['default.png','cv-gilbert-2026.pdf'],true));
}
expect(!str_contains($zip->getFromName('public_html/index.html'),'localhost'));
echo "PASS: release layout, private/public separation and secret/upload exclusions.\n";
