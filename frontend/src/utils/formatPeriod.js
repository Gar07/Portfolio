// Tahun 0 menyimpan tahun yang belum diketahui tanpa mengarang tanggal.
export function formatPeriod(start, end, unknown = 'Sedang menempuh studi') {
  if (!Number(start) && !Number(end)) return unknown;
  if (!Number(start)) return `Selesai ${end}`;
  return `${start} — ${Number(end) ? end : 'Sekarang'}`;
}
