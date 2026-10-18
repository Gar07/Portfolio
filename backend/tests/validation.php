<?php
require_once __DIR__ . '/../library/validation.php';
function expect(bool $condition): void { if (!$condition) throw new RuntimeException('Validation check failed.'); }
function rejects(callable $fn): void {
    try { $fn(); } catch (InvalidArgumentException $e) { return; }
    throw new RuntimeException('Invalid input accepted.');
}
expect(portfolioText("  satu\r\ndua  ", 8) === "satu\ndua");
expect(portfolioText('éé', 2) === 'éé');
expect(portfolioText('', 0) === '');
foreach ([[], 123, "\xFF", 'terlalu panjang'] as $invalid) rejects(fn() => portfolioText($invalid, 3));
foreach (['', 'https://github.com/Gar07/', 'http://localhost:5173/'] as $url) expect(portfolioUrl($url) === $url);
foreach (['javascript:alert(1)', 'data:text/html,test', 'ftp://example.com', '//example.com', 'https://', ['https://example.com']] as $url) rejects(fn() => portfolioUrl($url));
foreach ([0, '0', 1950, '2026', 2099] as $year) expect(portfolioYear($year) === (int) $year);
foreach ([-1, 1949, 2100, '2026x', 2026.5, [], ''] as $year) rejects(fn() => portfolioYear($year));
echo "PASS: UTF-8, batas teks, URL, dan tahun.\n";
foreach (['mailto:gar@example.com','tel:+62812345678','https://github.com/Gar07/'] as $url) expect(portfolioContactUrl($url) === $url);
foreach (["mailto:test@example.com\r\nBcc:x@example.com",'mailto:invalid','tel:javascript:alert(1)','javascript:alert(1)'] as $url) rejects(fn() => portfolioContactUrl($url));
foreach ([[],true,'1x',-1] as $id) rejects(fn() => portfolioId($id));
expect(portfolioId('123') === 123);
