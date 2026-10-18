# Audit kesiapan publikasi — 18 Oktober 2026

Repo ini adalah portofolio pribadi satu pemilik: React/Vite menampilkan data PHP/MySQL, dengan panel admin untuk profil dan enam kelompok konten. Audit mengasumsikan pengunjung publik dan satu pengelola; bukan layanan multi-tenant. UI minimalis dan data profil yang sudah ada dipertahankan.

## Temuan yang diperbaiki

| Prioritas | Kasus sebelum perbaikan | Perbaikan dan pemilik perilaku |
| --- | --- | --- |
| Tinggi | Browser produksi tetap memanggil localhost:8000; frontend/API terpisah perlu konfigurasi origin | API relatif /api, proxy Vite saat lokal, gateway PHP dan rewrite SPA di deploy/. Runtime produksi hanya PHP/MySQL. |
| Tinggi | Token bearer permanen disimpan plaintext di MySQL dan localStorage, dikirim melalui query GET | commonfunction.php memakai sesi PHP HttpOnly/Secure/SameSite=Strict, expiry idle 30 menit/total 8 jam, CSRF untuk perubahan, bootstrap sesi saat refresh, dan invalidasi sesi lain saat password berubah. Token lama dibersihkan oleh migrasi; kolom lama dipertahankan demi kompatibilitas skema. |
| Tinggi | Percobaan password tidak dibatasi | login.php memakai counter MySQL atomik per IP: 10 percobaan dalam 15 menit, respons 429 + Retry-After. Berlaku lintas PHP worker. |
| Tinggi | Kredensial DB hardcoded dan installer membuat admin/admin123 serta CREATE DATABASE portofolio | Config lokal di luar document root/Git, DB dibuat melalui hPanel, kredensial admin pertama wajib diberikan melalui environment; password demo lama ditolak pada produksi. |
| Tinggi | Penempatan source mentah dapat membuka migrasi, konfigurasi atau upload pada server yang salah | Paket allowlist memisahkan public_html dan portfolio-private; hanya gateway PHP publik. Nama/ekstensi upload dibatasi dan dilayani sebagai data; akses dotfile/source/dump diblokir oleh aturan web. |
| Sedang | URL kontak javascript: dapat tersimpan; array/nonteks dan JSON tidak valid dapat memicu error tidak terkendali | validation.php membatasi HTTP/HTTPS/mailto/tel, tipe/ukuran teks, ID/tahun/level. safeLink.js juga menolak skema berbahaya pada data lama. Controller membaca objek JSON/form melalui helper yang sama. |
| Sedang | Error koneksi/query bisa mengungkap detail internal; respons tidak konsisten | Handler pusat memberi JSON generik 500 dan log server, validasi 400, body terlalu besar 413. Profil yang belum diinisialisasi menghasilkan 503. |
| Sedang | Pergantian password/username berpotensi menimbulkan sesi atau identitas ambigu | Hash password dipakai sebagai versi sesi; rotasi session ID, minimal password baru 12–72 byte, index username unik dan pemeriksaan duplikat tanpa menghapus akun. |
| Sedang | Tidak ada paket rilis/CI/checksum atau jalur update yang menjaga unggahan | scripts/package.php menghasilkan ZIP berstruktur tetap + SHA-256, tests/package.php memeriksa batas publik/privat. Workflow GitHub menjalankan lint/tes/audit/build dan mengunggah artifact. HOSTINGER.md menjelaskan backup, migrasi, update dan rollback. |
| Rendah | Dependency hook hilang dan import tak dipakai; dokumen masih menjelaskan autentikasi lama | Callback pemuatan data distabilkan, import dibersihkan, lint menolak warning. README dan materi presentasi diperbarui. HTML panduan memakai CSS lokal sederhana tanpa stylesheet CDN. |

## Bukti lokal

- PHP 8.3.26, Node 24, MySQL 8.4 dan Apache 2.4.66 pada Windows.
- Seluruh PHP lolos pemeriksaan sintaks; lint frontend tanpa warning. Dua aturan advisory dinonaktifkan dengan alasan pada README; pemeriksaan dependency hook tetap aktif.
- Tes unit PHP: UTF-8/panjang, tipe ID, rentang tahun, skema URL, dan atribut cookie produksi/strict session.
- Tiga berkas tes JavaScript: format periode, definisi level dan URL aman.
- **55 pemeriksaan API** pada database acak sementara: CRUD pendidikan/pengalaman/keahlian/karya/kontak/pencapaian, payload parsial, sesi/cookie/CSRF, refresh, idle/absolute expiry, rotasi password, logout, pembatasan login, validasi serta unggahan/rollback.
- Build Vite berhasil; npm audit melaporkan **0 kerentanan** pada lockfile yang diperiksa. Ini hasil saat audit, bukan jaminan bahwa advisory baru tidak akan muncul.
- Pemeriksaan ZIP memastikan konfigurasi lokal, dump SQL, node_modules, tests dan unggahan pribadi tidak ikut; hanya dua aset publik bawaan yang masuk.
- Paket diekstrak dan dijalankan pada Apache lokal. Root/login/dashboard berhasil 200, API publik 200, endpoint admin tanpa sesi 401, migrasi melalui HTTP 404, konfigurasi/dotfile 403, CV PDF 200. Aturan produksi mengembalikan 301 ke https://gar2007.me/dashboard.
- Untuk pemeriksaan UI HTTP lokal, hanya pengalihan canonical HTTPS di salinan .qa yang dilepas sesudah respons 301 diverifikasi; paket produksi tetap memakai pengalihan. Ini bukan uji sertifikat TLS Hostinger.
- Browser pada paket Apache: login, refresh dashboard, muat admin, tambah keahlian sementara, level Advanced tampil pada publik, pencarian Socket.IO menemukan Cyber Kampung, filter level, tema, logout dan penolakan dashboard sesudah logout berhasil. Tidak ada error JavaScript pada alur admin yang diperiksa. Viewport 390 dan 320 px tidak mengalami overflow horizontal halaman publik.
- Database lokal dibandingkan dengan backup sebelum audit melalui database salinan: **63 baris pada delapan tabel sama**, kecuali kolom token bearer lama yang sengaja dibuang. Pengujian mutasi memakai database terisolasi, bukan data asli.

## Batas dan keputusan yang disengaja

- Hostinger belum diakses dan tidak ada deploy produksi pada audit ini. SSL, open_basedir, PHP/session storage, izin uploads, cache/CDN dan detail koneksi harus diperiksa pada hosting mengikuti HOSTINGER.md.
- Audit merupakan penelusuran source manual dan regresi terarah; bukan pentest menyeluruh, uji beban, verifikasi semua browser atau pengukuran Lighthouse.
- Batas login per IP sesuai portofolio pribadi; pengguna satu jaringan dapat berbagi batas dan serangan terdistribusi memerlukan proteksi hosting. Tidak ditambahkan CAPTCHA atau layanan eksternal.
- Upload PDF/gambar oleh admin sengaja menjadi konten publik. MIME/ukuran/nama diperiksa; tidak ada pemindai malware atau sanitasi isi PDF. Hanya unggah berkas yang sudah diperiksa pemilik.
- Rilis manual dapat memiliki jeda selama penyalinan. Simpan aset ber-hash lama, backup dan versi sebelumnya; tidak ditambahkan orkestrator deploy/worker/server Node.
- Source GitHub memuat seed kurasi, bukan ekspor langsung database pribadi. Untuk membawa semua edit admin ke hosting, gunakan ekspor/impor privat dan salin uploads sesuai panduan. CV adalah berkas tersendiri dan tidak otomatis mengikuti edit database.
- main.php aman diulang untuk skema/data yang sudah ada. update-content.php/update-profile.php adalah alat migrasi isi historis dan tidak menjadi langkah deploy rutin. DDL MySQL memerlukan backup; transaksi isi tidak membatalkan ALTER TABLE.
- Kode pemilik tidak diberi lisensi open source baru tanpa keputusan pemilik; dependensi mengikuti lisensi masing-masing. Modul kuliah/PDF sumber tidak dimasukkan ke repo.

**Verdict:** temuan yang menghalangi publikasi source dan paket deploy telah ditangani serta diuji lokal. Kesiapan lingkungan Hostinger perlu dibuktikan saat pemasangan.
