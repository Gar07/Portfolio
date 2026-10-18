# Deploy ke gar2007.me — Hostinger Website Hosting

Alur yang disarankan: **build di komputer/GitHub → unggah ZIP → isi koneksi MySQL → jalankan migrasi melalui SSH**. Server hanya menjalankan PHP dan MySQL. React sudah menjadi HTML/CSS/JS statis. Tidak perlu membuat aplikasi Node.js, port API, worker, PM2, atau aturan CORS.

Dokumentasi resmi Hostinger diperiksa pada 18 Oktober 2026. Label menu hPanel bisa berubah. Salin kredensial, host database, port dan perintah SSH dari hPanel milik Anda; contoh ini tidak menyimpan kredensial hosting.

## 1. Siapkan website, SSL, dan database

1. Pada **Websites → Dashboard gar2007.me**, gunakan website PHP/HTML atau custom PHP. Gunakan hosting website biasa untuk aplikasi ini. Fitur Node.js tersedia di paket Anda tetapi tidak dibutuhkan.
2. Pastikan domain dan www mengarah ke hosting. Nameserver yang Anda berikan sudah nameserver Hostinger; tidak perlu menggantinya untuk proyek ini.
3. Cari **SSL** di sidebar, pastikan sertifikat aktif untuk domain dan www serta **Force HTTPS** aktif. Paket mengalihkan www dan HTTP menuju `https://gar2007.me`.
4. Cari **PHP Configuration**: gunakan PHP **8.3 atau 8.4**, aktifkan `mysqli/mysqlnd`, `mbstring`, `fileinfo`, `session`. Atur `upload_max_filesize=6M`, `post_max_size=16M`, `display_errors=Off`, `log_errors=On`. Pastikan PHP CLI yang dipakai migrasi juga versi 8.3+ (`php -v`). Ekstensi `zip` hanya diperlukan saat membuat paket di komputer/CI.
5. Buka **Databases → Management**. Pilih website gar2007.me, buat database dan pengguna database baru, gunakan password unik. Catat **nama lengkap** database dan pengguna beserta prefix akun yang ditambahkan Hostinger. Host MySQL mengikuti detail hPanel (umumnya localhost); password database berbeda dari password admin website.
6. Buka **Advanced → SSH Access** (atau cari SSH Access), aktifkan lalu salin perintah SSH yang ditampilkan. Gunakan port dari hPanel; jangan menebak port 22.

## 2. Ambil paket

Di komputer, Node.js 24 dan PHP 8.3+ dengan ekstensi zip:

```powershell
npm ci --prefix frontend
npm run release
```

Hasilnya `release/portfolio-hostinger.zip` dan `release/SHA256SUMS.txt`. Alternatif: buka **GitHub → Actions → Verify and package → run yang hijau → Artifacts → portfolio-hostinger**, unduh lalu ekstrak bungkus artifact GitHub untuk mendapatkan ZIP deploy.

Paket tidak berisi password, database lokal, node_modules atau unggahan admin. Dua aset bawaan (foto fallback dan CV publik) disertakan. Source GitHub menggunakan data kurasi awal; perubahan admin yang hanya tersimpan di MySQL tidak otomatis masuk Git.

## 3. Unggah dan tempatkan berkas

**Sebelum menimpa website yang sudah ada, unduh cadangan berkas dan ekspor database dari hPanel.** Ikuti lokasi home/root dari hPanel, karena nama direktori akun dapat berbeda.

Pilihan termudah: SFTP lewat klien berkas menggunakan detail SSH, atau File Manager **akses semua berkas hosting**. Simpan ZIP di direktori domain, **satu tingkat di atas public_html**, kemudian ekstrak di sana. Jika File Manager hanya membuka public_html, gunakan akses semua berkas atau SSH untuk pindah ke direktori domain. Jangan mengekstrak seluruh paket ke dalam public_html.

Struktur akhirnya:

```text
domains/gar2007.me/
├── public_html/
│   ├── .htaccess
│   ├── index.html
│   ├── favicon.svg
│   ├── assets/
│   └── api/index.php
└── portfolio-private/
    ├── .htaccess
    ├── config.example.php
    ├── config.local.php          ← dibuat sendiri di server
    ├── admin-password.php
    └── backend/
        ├── index.php
        ├── library/
        ├── src/
        ├── migration/
        └── uploads/             ← pertahankan saat update
```

Jika mengunggah melalui SSH, contoh setelah menyalin ZIP ke home akun:

```sh
cd ~/domains/gar2007.me
pwd
unzip ~/portfolio-hostinger.zip
ls -la public_html
ls -la portfolio-private
```

Pastikan `.htaccess` ikut tersalin (berkas tersembunyi). Jika hosting sebelumnya memiliki index.php/WordPress, pindahkan berkas lama ke cadangan di luar public_html; jangan mencampur dua aplikasi pada root yang sama. Folder `portfolio-private` tidak boleh menjadi subfolder public_html.

## 4. Isi konfigurasi satu kali

```sh
cd ~/domains/gar2007.me
cp portfolio-private/config.example.php portfolio-private/config.local.php
nano portfolio-private/config.local.php
chmod 600 portfolio-private/config.local.php
```

Isi `db_host`, `db_name`, `db_user`, `db_password` dengan detail MySQL hPanel. Pertahankan:

```php
'environment' => 'production',
'origin' => 'https://gar2007.me',
```

Tidak ada pengaturan base URL pada React. Browser selalu memakai `/api`; www diarahkan ke domain utama. Jangan commit config.local.php. Direktori umumnya 755, berkas 644, konfigurasi 600; jangan memakai izin 777. Pastikan proses PHP dapat menulis `portfolio-private/backend/uploads` dan direktori sesi PHP hosting.

## 5. Inisialisasi database dan akun admin

Untuk database baru yang kosong, jalankan satu kali dari direktori domain:

```sh
read -r -p "Username admin: " PORTFOLIO_ADMIN_USER
read -r -s -p "Password admin baru (12-72 byte): " PORTFOLIO_ADMIN_PASSWORD
printf '\n'
export PORTFOLIO_ADMIN_USER PORTFOLIO_ADMIN_PASSWORD
php portfolio-private/backend/migration/main.php
unset PORTFOLIO_ADMIN_USER PORTFOLIO_ADMIN_PASSWORD
```

Password tidak tercetak di terminal dan tidak ditulis sebagai argumen command/history. Tidak ada akun default. Gunakan password unik dari password manager. `main.php` hanya membuat tabel pada database yang sudah dibuat di hPanel. Instalasi baru mengisi profil dan konten kurasi. Jika akun sudah ada, hanya skema yang diperbarui; akun, password, dan konten tidak direset. Token bearer lama dibersihkan.

**Jika ingin membawa semua edit admin dari komputer**, ekspor database lokal secara privat, impor ke database Hostinger melalui phpMyAdmin, dan salin unggahan lokal ke `portfolio-private/backend/uploads`. Jangan mengunggah dump SQL ke public_html/GitHub. Kemudian jalankan main.php untuk skema terbaru. Ganti password demo sebelum produksi memakai langkah pemulihan di bawah. Jangan mengimpor ulang seed ke database yang sudah berisi edit produksi.

Migration isi `update-content.php` adalah alat kurasi lama, bukan langkah rutin deploy/update. Jalankan hanya jika memang membutuhkan kurasi tersebut setelah backup; marker melindungi pengulangan, tetapi eksekusi pertama tetap mengubah isi tertentu.

## 6. Periksa sebelum dianggap selesai

- Buka `https://gar2007.me`, pastikan profil/proyek tampil dan foto serta unduh CV bekerja.
- Buka `https://www.gar2007.me` dan versi HTTP: keduanya harus menuju HTTPS domain utama.
- Buka `https://gar2007.me/login`, masuk dengan akun baru, coba satu edit konten lalu cek publik.
- Refresh langsung di `/dashboard`: halaman tetap terbuka setelah sesi diverifikasi; logout harus mengakhiri sesi.
- Coba `/api/public`: respons JSON tanpa password/token.
- Coba `/api/migration/main.php`, `/config.local.php`, `/portfolio-private/config.local.php`: tidak boleh mengeluarkan source atau kredensial (403/404). Periksa juga dari browser incognito.
- Cek ponsel, mode gelap, filter, dan konsol browser untuk error. Hindari cache publik untuk semua `/api/*`; respons API memakai no-store. Jika mengaktifkan CDN/cache Hostinger, kecualikan API dan bersihkan cache HTML seusai update.
- Aktifkan dan uji pemulihan backup dari hPanel. Jadwal/frekuensi backup mengikuti paket; unduh salinan berkas+database sebelum setiap update.

## Update berikutnya

1. Pastikan GitHub Actions hijau. Unduh ZIP dari commit yang akan dipasang; simpan checksum dan ZIP versi sebelumnya.
2. Cadangkan database, seluruh uploads, dan konfigurasi di luar public_html.
3. Ekstrak ZIP baru ke direktori staging di luar public_html.
4. Salin source `portfolio-private/backend/{library,src,migration,index.php}` dan `admin-password.php` dari staging. **Pertahankan config.local.php dan seluruh uploads yang sudah ada.** Aset bawaan cukup disalin jika belum ada. Jangan gunakan sinkronisasi dengan opsi delete pada direktori privat.
5. Jalankan `php portfolio-private/backend/migration/main.php`. Tidak perlu environment password untuk database yang sudah memiliki akun. Perubahan skema bersifat aditif; DDL MySQL tidak dapat dianggap rollback otomatis.
6. Salin berkas frontend staging ke public_html termasuk .htaccess dan api/index.php. Salin semua aset baru sebelum index.html. Simpan aset ber-hash versi sebelumnya sementara agar tab lama tidak kehilangan JavaScript. Pilih waktu sepi; upload manual bukan pergantian atomik.
7. Bersihkan cache HTML/CDN jika dipakai, lalu ulangi pemeriksaan langkah 6. Database dan unggahan tidak ditimpa oleh update source.

**Rollback:** pulihkan source/frontend dari paket sebelumnya dan pertahankan config serta uploads. Kolom tambahan boleh tetap ada jika kode lama kompatibel. Jika isi/skema perlu benar-benar dikembalikan, gunakan pasangan cadangan database+uploads dan hentikan edit admin selama pemulihan; simpan berkas baru yang muncul setelah backup. Jangan menjalankan DROP atau reset database untuk mengatasi error deploy.

## Pemulihan akun dan kendala

Ganti password akun yang sudah ada (juga membatalkan semua sesi lama):

```sh
cd ~/domains/gar2007.me
read -r -p "Username admin yang ada: " PORTFOLIO_ADMIN_USER
read -r -s -p "Password baru (12-72 byte): " PORTFOLIO_ADMIN_PASSWORD
printf '\n'
export PORTFOLIO_ADMIN_USER PORTFOLIO_ADMIN_PASSWORD
php portfolio-private/admin-password.php
unset PORTFOLIO_ADMIN_USER PORTFOLIO_ADMIN_PASSWORD
```

| Gejala | Pemeriksaan |
| --- | --- |
| /api/public memberi 500 | Lihat error log PHP; periksa config, nama DB/prefix, password, host, ekstensi dan migrasi. Pesan rinci sengaja tidak dikirim ke pengunjung. |
| /api/public menghasilkan HTML | Gateway api/index.php atau .htaccess salah tempat; frontend dan folder privat harus bersaudara. |
| Refresh /dashboard 404 | Pastikan .htaccess terlihat dan ikut diupload; hosting harus mengaktifkan rewrite. |
| Redirect berulang | Pertahankan Force HTTPS hPanel; periksa pengalihan tambahan/proxy/CDN di akun. Jangan mematikan Secure cookie. |
| Login berhasil lalu kembali ke login | Pastikan domain utama HTTPS, browser menerima cookie, sesi PHP dapat ditulis, cache API dinonaktifkan, serta waktu server benar. |
| Login 429 | Tunggu maksimal 15 menit sejak jendela percobaan dimulai; pembatasan per IP berlaku lintas worker. Sepuluh percobaan per 15 menit berarti jaringan bersama dapat berbagi batas. |
| Upload gagal/413 | Batas aplikasi 5 MB per berkas; PHP upload_max_filesize minimal 6M dan post_max_size 16M; cek izin uploads. |
| Perubahan admin tidak terlihat | Muat ulang publik, cek DB yang dipakai, dan cache CDN; aplikasi belum memakai sinkronisasi real time. |
| Node/PHP CLI tidak ditemukan | Build bisa diambil dari artifact GitHub; SSH hanya perlu PHP CLI untuk migrasi. Cocokkan PHP CLI 8.3+ dengan konfigurasi web hosting. |

Tidak ada cron atau worker khusus. Sesi berakhir setelah 30 menit tidak aktif atau 8 jam sejak login. Cookie HttpOnly/Secure/SameSite=Strict mengautentikasi admin; token CSRF memvalidasi perubahan. Login dibatasi oleh MySQL sehingga beberapa PHP worker tetap memakai hitungan yang sama.

## Sumber resmi Hostinger

Dibaca 18 Oktober 2026; gunakan dokumentasi **Web/Cloud Website Hosting**, bukan panduan cPanel, VPS, atau Agency yang berbeda.

- [Membuat MySQL database di hPanel](https://www.hostinger.com/support/1583542-how-to-create-a-new-mysql-database-in-hostinger/) — prefix nama database/pengguna, pemilihan website.
- [SSH pada hosting website](https://www.hostinger.com/support/1583245-how-to-connect-to-a-hosting-plan-via-ssh-in-hostinger/) — aktifkan akses dan salin perintah/port dari hPanel; mendukung PowerShell.
- [Upload dan extract melalui File Manager](https://www.hostinger.com/support/1869114-how-to-upload-backup-with-file-manager/) — arsip diekstrak ke direktori pilihan; struktur khusus aplikasi ini tetap mengikuti panduan di atas.
- [Import database melalui SSH](https://www.hostinger.com/support/4536306-how-to-import-a-database-over-ssh-in-hostinger/) — buat database dahulu dan sesuaikan konfigurasi. Untuk proyek ini migrasi PHP langsung membuat tabel, sehingga tidak memerlukan dump SQL saat instalasi baru.
- [SSL dan Force HTTPS](https://www.hostinger.com/support/1583201-how-to-enable-or-disable-https-for-your-website-at-hostinger/) — HTTPS aktif secara default setelah sertifikat dipasang.
- [Ekstensi dan opsi PHP](https://www.hostinger.com/support/4667515-how-to-manage-php-extensions-and-options-in-hostinger/) — dua tab PHP Configuration untuk ekstensi dan parameter; simpan perubahan melalui hPanel.

Panduan ini menyiapkan deploy; belum membuktikan konfigurasi hPanel atau hasil situs produksi karena akses hosting belum digunakan.
