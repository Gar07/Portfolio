# Portofolio Gilbert Aldrich Rumahorbo

Portofolio mahasiswa S1 Ilmu Komputer Universitas Negeri Medan. React 19 + Vite menampilkan data dari REST API PHP native dan MySQL. Admin mengelola profil, pendidikan, pengalaman, keahlian, proyek, pencapaian, dan kontak. Tidak ada dependensi runtime baru untuk pembaruan ini.

## Konten yang dikurasi

| Bagian | Isi dan perilaku |
| --- | --- |
| Profil | Nama, nama panggilan, status mahasiswa, bio, domisili umum, empat fokus, foto, dan kontak. Tanggal lahir serta alamat rinci tidak ditampilkan. |
| Proyek | Empat proyek pilihan dari sepuluh proyek. Teknologi, peran, tahun, kode sumber, demo, serta uraian masalah dan pendekatan. Pencarian mencakup seluruh proyek dan teknologi, termasuk proyek di luar pilihan. |
| Riwayat | Dua pendidikan dan lima pengalaman/kontribusi. Periode dan uraian kontribusi dapat diedit. Tahun tidak diketahui disimpan sebagai `0`; tahun selesai `0` menandakan masih berjalan. |
| Keahlian | 37 teknologi dalam enam kategori. Level yang sebelumnya diisi tetap dipertahankan. Teknologi tambahan memakai level kosong atau **Belum dinilai**. Definisi empat level dan filter membantu pengunjung memahami penilaian mandiri. |
| Pencapaian | Empat prestasi/apresiasi/kegiatan. Admin dapat menambah sertifikasi atau URL bukti yang memang tersedia. Apresiasi CyberWise dikategorikan sebagai prestasi, bukan sertifikasi kompetensi. |
| CV | PDF dua halaman dapat diunduh pengunjung dan diganti/dihapus lewat Biodata. **CV merupakan berkas tersendiri dan tidak berubah otomatis saat data web diedit.** |
| Cetak portofolio | Cetak/simpan PDF browser memuat seluruh proyek, riwayat, keahlian, uraian yang biasanya dilipat, pencapaian, dan kontak meskipun filter layar sedang aktif. Berbeda dengan CV ringkas yang diunduh. |

UI memakai font sistem, warna netral, aksen hijau, mode terang/gelap, dan kontrol sederhana. Modal memakai `<dialog>`; navigasi admin mobile memakai select native. Tidak ada blog kosong, metrik performa proyek, tautan demo rekaan, atau logo sertifikasi tanpa data pendukung.

## Deploy website

Ikuti [HOSTINGER.md](HOSTINGER.md) untuk gar2007.me. Satu domain melayani frontend statis dan API `/api`; produksi hanya memerlukan PHP/MySQL. Node.js 24 digunakan saat build di komputer/CI. Tidak ada server Node, worker atau CORS yang perlu dikonfigurasi.

```powershell
npm ci --prefix frontend
npm run release
```

Hasil: `release/portfolio-hostinger.zip` dengan checksum SHA-256. GitHub Actions juga membangun artifact dari commit yang lolos lint, tes, dan audit dependensi. Backend/config berada di `portfolio-private`, bersaudara dengan `public_html`. Jangan upload source repo langsung ke document root.

## Menjalankan aplikasi lokal

Kebutuhan: Node.js 24, PHP 8.3+ (`mysqli/mysqlnd`, `mbstring`, `fileinfo`, `session`; `zip` untuk paket), MySQL 8/MariaDB. Aktifkan MySQL Laragon; buat database `portofolio` lokal terlebih dahulu. Atur PHP `upload_max_filesize=6M` dan `post_max_size=16M`.

Salin `config.example.php` menjadi `config.local.php` pada root repo, isi environment `local`, origin `http://localhost:5173`, db_host `127.0.0.1`, db_name `portofolio`, dan kredensial MySQL lokal. Konfigurasi lokal diabaikan Git. Jangan menggunakan konfigurasi lokal pada hosting.

Instalasi baru meminta akun pilihan sendiri melalui environment:

```powershell
$env:PORTFOLIO_ADMIN_USER = Read-Host 'Username admin'
$portfolioPassword = Read-Host 'Password baru (12-72 byte)' -AsSecureString
$env:PORTFOLIO_ADMIN_PASSWORD = [Net.NetworkCredential]::new('', $portfolioPassword).Password
php backend/migration/main.php
Remove-Item Env:PORTFOLIO_ADMIN_USER, Env:PORTFOLIO_ADMIN_PASSWORD
```

Tidak ada akun default. Jika akun sudah ada, main.php hanya memperbarui skema dan membuang token bearer lama. Data dan password dipertahankan. Cadangkan database dan uploads sebelum migrasi. `update-content.php` adalah migrasi kurasi sekali jalan; tidak dijalankan saat update rutin. `update-profile.php` dipertahankan sebagai alat migrasi legacy, bukan langkah instalasi baru.

Terminal backend:

```powershell
php -S localhost:8000 -t backend backend/index.php
```

Terminal frontend (dari root repo):

```powershell
npm ci --prefix frontend
npm --prefix frontend run dev -- --host localhost --port 5173
```

Buka [publik](http://localhost:5173) atau [admin](http://localhost:5173/login). Vite meneruskan `/api` ke PHP lokal; browser tetap menggunakan satu origin. Built-in server PHP dan Vite hanya untuk pengembangan.

## Sesi dan batas akses

Cookie sesi PHP bersifat HttpOnly, SameSite=Strict, dan Secure pada produksi. Sesi diverifikasi ulang saat halaman dimuat, kedaluwarsa setelah 30 menit tidak aktif atau 8 jam total. Nilai `token` pada respons/form sekarang adalah token CSRF; ia tidak dapat dipakai login tanpa cookie. Tidak ada kredensial sesi di localStorage atau query URL. Mengubah password membatalkan sesi lain. Login dibatasi 10 percobaan per IP per 15 menit melalui hitungan MySQL bersama. Password baru 12–72 byte; akun demo lama ditolak di produksi. Pemulihan akun lewat `scripts/admin-password.php` dijelaskan di panduan hosting.

## Data dan sumber

Kurasi tersimpan pada `backend/migration/profile-data.php`, berdasarkan informasi pemilik tanggal 18 Oktober 2026. Foto/email/kontak berasal dari profil GitHub Gar07 yang sudah dipakai sebelumnya. URL repositori dan homepage dicocokkan dengan metadata publik GitHub; ketersediaan demo pihak ketiga dapat berubah.

- [JudolHunter](https://github.com/Gar07/JudolHunter)
- [DFA Simulator](https://github.com/Gar07/DFA-Simulator)
- [Color Blindness Corrector & Simulator](https://github.com/Gar07/CVD)
- [Veripix](https://github.com/Gar07/Veripix)
- [SODA-BIP](https://github.com/Gar07/SODA-BIP)
- [Vizin](https://github.com/Gar07/vizin)

HeptaGnosis disebut rancangan konseptual; kegiatan jaringan BRI dijelaskan sebagai eksplorasi/persiapan teknis. Angka GEMASTIK mengikuti data pemilik. Berkas sertifikat, rincian pelatihan Dicoding/Udemy, dan metrik eksperimen belum diberikan sehingga tidak dibuatkan bukti atau angka tambahan. Blog menunggu tulisan asli. C# pada keahlian lama dipertahankan agar data admin tidak hilang; CV awal memakai C/C++ sesuai profil yang baru diberikan.

## Pemeriksaan

```powershell
npm run lint
npm run test
npm run release
php tests/package.php
npm audit --prefix frontend --audit-level=moderate
```

`npm run test` memerlukan MySQL lokal aktif dan config.local.php environment local. Tes membuat database acak `portfolio_test_*`, menyalin aplikasi ke direktori sementara, lalu membersihkannya; akun MySQL pengujian memerlukan izin CREATE/DROP database. Jangan jalankan dengan akun produksi. `PHP_BINARY` dapat diisi path absolut php jika belum ada di PATH. Port 18081 harus tersedia.

Tes mencakup UTF-8, URL/skema kontak, tahun, ID, level, format periode, CRUD enam entitas, sesi/cookie, CSRF, kedaluwarsa, rotasi password, throttle, MIME/ukuran upload dan rollback berkas. `tests/package.php` memeriksa struktur rilis serta pengecualian konfigurasi/dump/unggahan pribadi. Dua aturan lint advisory (export campuran untuk context/helper dan pemuatan data dalam effect) dimatikan secara eksplisit karena sesuai struktur aplikasi; pemeriksaan dependency hook dan unused variable tetap aktif, dan warning lain menggagalkan lint.

Hasil audit dan batas verifikasi dicatat dalam [AUDIT.md](AUDIT.md). Build atau audit npm yang lulus bukan jaminan bahwa konfigurasi produksi sudah benar. Tidak ada klaim skor Lighthouse atau audit penetrasi menyeluruh.

## Endpoint dan kepemilikan kode

| Endpoint | Metode | Pemilik perilaku |
| --- | --- | --- |
| `/api/public` | GET | `src/public.php`: field publik eksplisit; tidak mengirim password/token |
| `/api/login`, `/api/logout`, `/api/verify_login` | POST / POST / GET | Sesi cookie dan token CSRF |
| `/api/users` | GET / POST / PUT | Profil, foto JPG/PNG/WebP, CV PDF; batas 5 MB per berkas |
| `/api/pendidikan`, `/api/pengalaman`, `/api/keahlian`, `/api/karya`, `/api/kontak`, `/api/pencapaian` | GET / POST / PUT / DELETE | CRUD dengan sesi admin dan CSRF untuk mutasi |
| `/api/uploads/<nama>` | GET | Router mengizinkan nama/ekstensi tertentu; PDF memakai header unduh dan `nosniff` |

`library/validation.php` memiliki aturan input baru; `library/uploads.php` memiliki validasi MIME/ukuran, nama acak, dan pembersihan berkas. Foto/CV lama diganti setelah penyimpanan database berhasil. `Public.jsx` mengatur tampilan dan filter; `utils/skillLevels.js` memiliki definisi level bersama publik/admin; CSS mengatur tema, responsivitas, dan hasil cetak.

Panduan belajar, narasi video, pembandingan dengan modul, dan latihan tanya jawab tersedia pada [PRESENTASI.md](PRESENTASI.md).

Kode aplikasi dan materi profil adalah milik pemilik proyek. Dependensi pihak ketiga mengikuti lisensi masing-masing pada paketnya. Repo ini tidak menambahkan lisensi open source untuk kode milik pemilik.
