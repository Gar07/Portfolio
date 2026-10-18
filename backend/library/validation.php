<?php
function portfolioId(mixed $value): int
{
    if (!is_int($value) && !is_string($value)) throw new InvalidArgumentException('ID tidak valid.');
    $id = filter_var($value, FILTER_VALIDATE_INT);
    if ($id === false || $id < 0) throw new InvalidArgumentException('ID tidak valid.');
    return $id;
}

function portfolioContactUrl(mixed $value): string
{
    $url = portfolioText($value, 1000);
    if (str_starts_with($url, 'mailto:') && filter_var(substr($url, 7), FILTER_VALIDATE_EMAIL)) return $url;
    if (preg_match('/^tel:\+?[0-9 ()-]{5,30}$/D', $url)) return $url;
    return portfolioUrl($url);
}
function portfolioText(mixed $value, int $max): string
{
    if (!is_string($value) || !mb_check_encoding($value, 'UTF-8')) throw new InvalidArgumentException('Nilai harus berupa teks UTF-8.');
    $value = trim(str_replace(["\r\n", "\r"], "\n", $value));
    if (mb_strlen($value, 'UTF-8') > $max) throw new InvalidArgumentException("Teks maksimal $max karakter.");
    return $value;
}
function portfolioUrl(mixed $value): string
{
    $url = portfolioText($value, 1000);
    if ($url !== '' && (!filter_var($url, FILTER_VALIDATE_URL) || !in_array(strtolower((string) parse_url($url, PHP_URL_SCHEME)), ['http', 'https'], true))) {
        throw new InvalidArgumentException('Tautan harus berupa URL HTTP atau HTTPS yang valid.');
    }
    return $url;
}
function portfolioYear(mixed $value): int
{
    $year = filter_var($value, FILTER_VALIDATE_INT);
    if ($year === false || ($year !== 0 && ($year < 1950 || $year > 2099))) throw new InvalidArgumentException('Tahun harus 1950–2099, atau 0 jika belum dicantumkan.');
    return $year;
}
