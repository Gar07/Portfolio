<?php
function savePortfolioUpload(string $field, array $types, string $current): string
{
    $file = $_FILES[$field] ?? null;
    if ($file && (!isset($file['error'],$file['size'],$file['tmp_name']) || is_array($file['error']) || !is_string($file['tmp_name']))) throw new InvalidArgumentException('Struktur unggahan tidak valid.');
    if (!$file || $file['error'] === UPLOAD_ERR_NO_FILE) return $current;
    if ($file['error'] !== UPLOAD_ERR_OK) throw new InvalidArgumentException('Unggah berkas gagal.');
    if ($file['size'] > 5 * 1024 * 1024) throw new LengthException('Ukuran berkas maksimal 5 MB.');
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    if (!isset($types[$mime])) throw new InvalidArgumentException($field === 'cv' ? 'CV harus berupa PDF.' : 'Foto harus berupa JPG, PNG, atau WebP.');
    $directory = __DIR__ . '/../uploads';
    if (!is_dir($directory) && !mkdir($directory, 0755, true)) throw new RuntimeException('Penyimpanan berkas tidak tersedia.');
    $name = bin2hex(random_bytes(16)) . '.' . $types[$mime];
    if (!move_uploaded_file($file['tmp_name'], $directory . '/' . $name)) throw new RuntimeException('Berkas tidak dapat disimpan.');
    return $name;
}

function removePortfolioUpload(string $name): void
{
    // Hanya berkas acak milik aplikasi; gambar dan CV bawaan tetap tersedia.
    if (preg_match('/^[a-f0-9]{32}\.(jpg|png|webp|pdf)$/', $name)) {
        $path = __DIR__ . '/../uploads/' . $name;
        if (is_file($path)) unlink($path);
    }
}
