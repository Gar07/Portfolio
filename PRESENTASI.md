# Panduan presentasi portofolio

Target: video sekitar 10–12 menit. Sesuaikan durasi dengan ketentuan dosen. Jelaskan masalah, keputusan, alur data, dan bukti hasil; tidak perlu membaca semua baris kode. Gunakan data contoh yang jelas untuk demo dan hapus setelah selesai. Jangan menampilkan password, token, atau dump database saat merekam.

## Apa yang paling layak ditampilkan

Urutkan profil singkat → empat proyek pilihan → satu studi kasus → pengalaman/pendidikan → kategori dan arti level keahlian → pencapaian → unduh CV → satu perubahan admin yang terlihat di publik. Ini memperlihatkan identitas, kemampuan memecahkan masalah, dan bahwa konten benar-benar berasal dari database.

Untuk meningkatkan isi berikutnya, prioritaskan bukti nyata: tangkapan layar hasil proyek, satu tantangan dan penyelesaian yang benar-benar Anda alami, URL bukti GEMASTIK/apresiasi yang boleh dipublikasikan, lalu satu catatan teknis asli. Ukur metrik eksperimen sebelum mencantumkan akurasi, kecepatan, atau persentase peningkatan. Tidak perlu menambah animasi, grafik aktivitas, atau chatbot untuk membuktikan kemampuan.

## Narasi video dan aksi layar

| Waktu | Aksi | Contoh narasi |
| --- | --- | --- |
| 0:00–0:45 | Tampilkan halaman utama | “Saya Gilbert Aldrich Rumahorbo, mahasiswa Ilmu Komputer Universitas Negeri Medan. Website ini menyajikan profil, proyek, pengalaman, dan keahlian saya. Tujuan pengembangannya adalah membuat portofolio mudah dipahami sekaligus dapat diperbarui melalui panel admin.” |
| 0:45–2:00 | Buka proyek dan satu uraian masalah | “Saya menampilkan empat proyek pilihan agar halaman awal tetap terarah. Sepuluh proyek tetap tersedia melalui tombol semua proyek. Setiap proyek memiliki peran, teknologi, tahun, dan tautan bila tersedia. Uraian ini menjelaskan masalah dan pendekatan; bukan hanya nama aplikasinya.” Tunjukkan pencarian `Socket.IO`, yang menemukan Cyber Kampung meskipun bukan proyek pilihan. |
| 2:00–3:00 | Riwayat, keahlian, pencapaian | “Riwayat menjelaskan kontribusi saya, bukan hanya jabatan. Keahlian dikelompokkan agar mudah dipindai. Level merupakan penilaian mandiri dengan definisi yang sama di admin dan publik. Teknologi yang belum saya nilai diberi keterangan Belum dinilai.” Pilih Advanced, baca artinya, lalu kembali ke semua level. |
| 3:00–3:40 | Unduh CV dan mode mobile/gelap | “CV adalah ringkasan dua halaman yang dapat diunduh dan diganti melalui admin. Cetak portofolio menghasilkan isi lengkap. Layout mengikuti ukuran layar dan memiliki pilihan tema.” |
| 3:40–5:00 | Login admin; tambah pencapaian contoh; muat ulang publik | “Perubahan dimulai dari formulir React. Setelah validasi browser, data dikirim ke endpoint PHP dengan cookie sesi dan token CSRF. PHP memverifikasi sesi dan CSRF dan memvalidasi input sebelum menjalankan prepared statement. Setelah tersimpan, halaman publik mengambil data terbaru.” Beri nama `Contoh presentasi`, simpan, perlihatkan di publik, lalu hapus contoh itu. |
| 5:00–6:10 | Tunjukkan alur di `backendApi.js`, `index.php`, `public.php` | “Browser tidak terhubung langsung ke MySQL. React mengirim HTTP ke API PHP. Router memilih controller; controller membaca database dan mengirim JSON. Endpoint public memilih field secara eksplisit sehingga password dan token tidak ikut dikirim.” |
| 6:10–7:30 | `Pencapaian.jsx` dan `src/pencapaian.php` | “State list menampung data, form menampung input, dan editing membedakan tambah serta ubah. Fungsi save memakai POST atau PUT. Di server, sesi admin wajib valid dan setiap perubahan memerlukan CSRF. Teks, jenis pencapaian, tahun, dan URL diperiksa lagi karena validasi browser dapat dilewati.” Jelaskan satu prepared statement dan parameter terikat. |
| 7:30–8:30 | `skillLevels.js`, bagian filter `Public.jsx` | “Definisi level dipusatkan agar admin dan publik tidak berbeda arti. Filter menghasilkan daftar dari data yang sudah diterima, sehingga tidak perlu request baru setiap kali pengguna mencari. Data asli tetap tersedia; cetak mengabaikan filter layar.” |
| 8:30–9:30 | `users.php` dan `uploads.php` | “PDF diperiksa dari MIME berkas di server, bukan hanya ekstensi. Ukuran dibatasi 5 MB dan nama penyimpanan dibuat acak. Jika CV gagal setelah foto sempat diunggah, foto baru dibersihkan. Berkas lama baru dibersihkan setelah update database berhasil.” |
| 9:30–10:30 | `schema.php`, `update-content.php`, hasil tes/build | “Skema diperluas tanpa menghapus tabel. Impor kurasi memakai transaksi dan marker sekali jalan agar edit admin tidak ditimpa saat perintah diulang. Akun dan level lama diperiksa sebelum commit. Pengujian mencakup input invalid, CRUD, unggahan, filter, dan tampilan mobile.” |
| 10:30–11:15 | Kembali ke publik | “Nilai tambah pengembangan saya adalah konten yang lebih bermakna, alur kelola yang lengkap, dan validasi yang dapat dijelaskan. Batasnya: data prestasi berasal dari pemilik, bukti sertifikat belum diunggah, CV tidak tersinkron otomatis, dan pengujian ini masih pada lingkungan lokal.” |

## Bedakan materi modul dan pengembangan

Modul **14. Praktik Backend-Frontend** sudah mengajarkan React/PHP/MySQL, REST API, autentikasi token, CRUD enam tabel, dan tampilan level keahlian publik. Jangan menyebut seluruh fondasi tersebut sebagai inovasi sendiri. Pada kode contoh modul, proyek berisi `nama_karya`, `deskripsi`, `url`; keahlian berisi nama dan level.

| Fondasi modul | Pengembangan pada versi ini | Mengapa bermanfaat |
| --- | --- | --- |
| Proyek: nama, deskripsi, URL | Teknologi, peran, tahun, unggulan, demo terpisah, uraian masalah dan pendekatan | Pengunjung memahami konteks dan kontribusi, bukan hanya hasil akhir |
| Nama dan level keahlian | Kategori, definisi bersama, filter, dan status Belum dinilai | Arti level konsisten dan tidak menebak kemampuan |
| Pengalaman berisi organisasi, jabatan, tahun | Periode lebih rinci dan uraian kontribusi | Menjelaskan apa yang dikerjakan |
| Enam entitas konten | Entitas pencapaian dengan CRUD dan URL bukti opsional | Prestasi/kegiatan dapat dikelola tanpa mengubah source |
| Biodata dan unggah foto | Bio/fokus/minat/domisili publik dan unggah CV PDF | Profil lebih informatif serta CV mudah diakses |
| Tampilan dasar | UI minimalis, tema, filter, dialog native, mobile, cetak seluruh isi | Informasi mudah dicari dan digunakan di berbagai layar |

## Cara menjelaskan kode tanpa menghafal

Gunakan pola: **input → pemeriksaan → proses → output → kemungkinan gagal**. Latih dengan satu fungsi CRUD sampai Anda bisa menelusurinya tanpa membaca narasi. Setelah itu tunjukkan bahwa endpoint lain mengikuti pola yang sama.

1. `frontend/src/pages/Public.jsx`: effect mengambil `/public`, state menyimpan hasil/pencarian/filter, hasil render disaring tanpa mengubah database. `beforeprint` membuka uraian yang dilipat; `afterprint` mengembalikan kondisi sebelumnya.
2. `frontend/src/api/backendApi.js`: Axios menangani HTTP; fungsi CRUD memisahkan URL dan metode dari komponen.
3. `frontend/src/components/Pencapaian.jsx`: muat daftar, isi form dari record saat edit, simpan POST/PUT, konfirmasi sebelum DELETE, muat ulang daftar setelah berhasil, tampilkan error jika gagal.
4. `backend/index.php`: validasi pola route dan allowlist nama/ekstensi berkas. URL yang tidak cocok mendapat 404.
5. `backend/src/pencapaian.php`: verifikasi sesi/CSRF, baca payload, validasi, prepared statement, JSON hasil; 400 untuk input salah, 404 untuk record edit yang tidak ada, 500 untuk kegagalan proses.
6. `backend/library/validation.php`: aturan input dipakai beberapa endpoint, sehingga batas teks, URL, dan tahun konsisten.
7. `backend/library/uploads.php` dan `src/users.php`: MIME/ukuran/nama acak serta urutan simpan dan bersihkan berkas menjaga perubahan profil tidak meninggalkan unggahan baru saat validasi gagal.
8. `backend/migration/schema.php` dan `update-content.php`: perluasan skema, penggabungan data, pemeriksaan pelestarian, transaksi, marker idempoten.
9. `frontend/src/App.css`: variabel tema, breakpoint, focus keyboard, dan CSS print; tidak perlu membaca setiap deklarasi.

## Latihan pertanyaan

| Pertanyaan | Inti jawaban |
| --- | --- |
| Mengapa React dan PHP dipisahkan? | React menangani interaksi/tampilan; PHP memiliki akses database dan validasi server. Keduanya bertukar JSON melalui HTTP. |
| Apa bedanya state dan database? | State adalah kondisi sementara pada browser; database menyimpan data setelah API berhasil. Refresh menghapus state sementara lalu mengambil data tersimpan. |
| Mengapa validasi dilakukan dua kali? | Browser memberi umpan balik cepat; server tetap menjadi batas kepercayaan karena request dapat dibuat tanpa formulir. |
| Apa fungsi prepared statement? | Memisahkan struktur SQL dari nilai input untuk menghindari input dianggap sintaks SQL. Bukan pengganti validasi atau otorisasi. |
| GET, POST, PUT, DELETE? | Membaca, menambah, memperbarui, dan menghapus. Controller memeriksa metode, sesi, serta CSRF pada operasi admin. |
| Apa fungsi token? | Pada versi deploy, cookie HttpOnly menyimpan ID sesi PHP. Nilai token di form adalah CSRF, bukan kredensial login. Sesi berakhir setelah 30 menit tidak aktif atau 8 jam total; password baru membatalkan sesi lain. |
| Apakah CORS melindungi API? | CORS mengatur akses lintas origin oleh browser. Aplikasi ini memakai satu origin melalui /api sehingga tidak memerlukan CORS. CORS bukan pengganti sesi/otorisasi dan tidak menghentikan semua klien HTTP. |
| Mengapa tidak memberi persentase skill? | Tidak ada pengukuran terstandar untuk persentase tersebut. Definisi level dan status belum dinilai lebih jujur. |
| Apakah semua proyek punya demo? | Tidak. Tombol hanya tampil ketika URL tersedia. Rancangan konseptual disebutkan secara jelas. |
| Apakah prestasi sudah diverifikasi independen? | Isinya mengikuti data pemilik. URL bukti opsional belum diisi; tidak ada klaim verifikasi atau sertifikat yang direkayasa. |
| Apa bedanya unduh CV dan cetak? | CV adalah berkas ringkas yang diunggah/diganti admin. Cetak memakai data halaman terbaru dan memuat seluruh konten. |
| Bagaimana mencegah migrasi menghapus data? | Backup, ALTER aditif, merge berdasarkan identitas, transaksi isi, pemeriksaan akun/level, dan marker agar pengulangan tidak menimpa edit. ALTER MySQL sendiri tidak dianggap dapat dirollback oleh transaksi isi. |
| Apa yang dibuktikan pengujian? | Kasus yang dijalankan berhasil pada lingkungan lokal. Build berhasil tidak otomatis membuktikan semua interaksi, semua browser, deployment, atau keamanan menyeluruh. |

## Sebelum merekam

- Aktifkan backend, frontend, MySQL; muat halaman publik dan cek foto/CV.
- Gunakan zoom editor yang terbaca, misalnya 125–150%, dan hanya buka file yang dibahas.
- Siapkan dua tab: publik dan admin. Muat ulang publik sesudah edit; belum ada sinkronisasi real time.
- Pilih satu contoh proyek yang Anda paling pahami. Tambahkan satu tantangan nyata dan penyelesaiannya dari pengalaman Anda sendiri.
- Rekam uji yang benar-benar dijalankan. Jelaskan hasil lint dan tes yang benar-benar dijalankan; jangan mengklaim skor Lighthouse hijau yang belum diukur.
- Latih pertanyaan dengan menutup narasi, jelaskan alur data dengan kata sendiri, lalu cocokkan dengan kode.
