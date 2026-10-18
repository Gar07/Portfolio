<?php
// Sumber: informasi pemilik, 18 Oktober 2026; tautan dicocokkan dengan GitHub publik Gar07.
return [
    'profil' => [
        'nama_lengkap' => 'Gilbert Aldrich Rumahorbo', 'nama_panggilan' => 'Gar / Gar2007',
        'bio' => 'Mahasiswa Ilmu Komputer yang mengembangkan aplikasi web, mengeksplorasi keamanan siber, dan menerapkan AI untuk analisis ancaman. Saya senang menghubungkan riset dengan alat yang bisa digunakan.',
        'domisili' => 'Medan, Sumatera Utara, Indonesia',
        'fokus' => "Keamanan siber & OSINT\nRekayasa perangkat lunak\nAI untuk keamanan\nJaringan & infrastruktur",
        'minat' => 'Di luar komputasi, saya menikmati astronomi dan astrofotografi, serta memainkan dan mengaransemen musik piano dengan keyboard MIDI.',
        'email' => 'gar2007xtech@proton.me', 'nomor_hp' => '',
        'foto' => 'https://avatars.githubusercontent.com/u/164188755?s=400&v=4', 'cv' => 'cv-gilbert-2026.pdf',
    ],
    'riwayat_pendidikan' => [
        ['nama_institusi' => 'Universitas Negeri Medan', 'tingkat' => 'S1', 'jurusan' => 'Ilmu Komputer', 'tahun_mulai' => 2024, 'tahun_selesai' => 0],
        ['nama_institusi' => 'SMAN 21 Medan', 'tingkat' => 'SMA', 'jurusan' => 'Pendidikan menengah', 'tahun_mulai' => 0, 'tahun_selesai' => 2024],
    ],
    'pengalaman' => [
        ['nama_perusahaan' => 'Sekolah Pascasarjana Universitas Negeri Medan', 'jabatan' => 'Asisten Mahasiswa Gugus Penjamin Mutu', 'tahun_mulai' => 2026, 'tahun_selesai' => 0, 'periode' => 'Mei 2026 – Sekarang', 'deskripsi' => 'Menangani operasional dan pemeliharaan sistem web administrasi SI-SPMI, pengelolaan server, serta infrastruktur digital ruang penjaminan mutu.'],
        ['nama_perusahaan' => 'Universitas Negeri Medan', 'jabatan' => 'Pengelola Sistem Web Konferensi AISTEEL 2026', 'tahun_mulai' => 2026, 'tahun_selesai' => 2026, 'periode' => 'September 2026', 'deskripsi' => 'Mengelola stabilitas dan alur platform web konferensi internasional AISTEEL 2026.'],
        ['nama_perusahaan' => 'Kegiatan jaringan lapangan · Lintong Nihuta / Tarutung', 'jabatan' => 'Eksplorasi dan persiapan teknis jaringan', 'tahun_mulai' => 2026, 'tahun_selesai' => 2026, 'periode' => 'Mei – Juni 2026', 'deskripsi' => 'Melakukan eksplorasi dan persiapan teknis untuk penerapan infrastruktur jaringan perbankan BRI di wilayah Lintong Nihuta dan Tarutung, Sumatera Utara.'],
        ['nama_perusahaan' => 'Axroz (sebelumnya Tribe Community)', 'jabatan' => 'Co-Founder', 'tahun_mulai' => 2024, 'tahun_selesai' => 2026, 'periode' => '2024 – 2026', 'deskripsi' => 'Menginisiasi komunitas digital yang berfokus pada teknologi, komputasi, dan ekosistem terdesentralisasi.'],
        ['nama_perusahaan' => 'Selidiki.id', 'jabatan' => 'Pengelola platform', 'tahun_mulai' => 2025, 'tahun_selesai' => 2026, 'periode' => '2025 – 2026', 'deskripsi' => 'Membangun dan mengelola layanan web investigasi digital berbasis open-source intelligence.'],
    ],
    // Kosong berarti belum dinilai; tingkat kemahiran teknologi baru tidak ditebak.
    'keahlian' => array_merge(
        array_map(fn($n) => ['nama_keahlian' => $n, 'level' => '', 'kategori' => 'Bahasa pemrograman'], ['Python','PHP','JavaScript','TypeScript','SQL','C / C++ / C#','Java','HTML / CSS']),
        array_map(fn($n) => ['nama_keahlian' => $n, 'level' => '', 'kategori' => 'Web & aplikasi'], ['Laravel','CodeIgniter 3','Vue.js 3','React','Next.js','Node.js / Express.js','NestJS','Streamlit','Tailwind CSS','Vite']),
        array_map(fn($n) => ['nama_keahlian' => $n, 'level' => '', 'kategori' => 'Basis data & penyimpanan'], ['PostgreSQL','MySQL','Redis','MinIO']),
        array_map(fn($n) => ['nama_keahlian' => $n, 'level' => '', 'kategori' => 'Keamanan & analisis'], ['Nmap','Burp Suite','Wireshark','Metasploit','Nuclei','Pwntools / GDB']),
        array_map(fn($n) => ['nama_keahlian' => $n, 'level' => '', 'kategori' => 'AI & komputasi'], ['Machine Learning','LightGBM','XGBoost','CatBoost','Ollama / llama.cpp']),
        array_map(fn($n) => ['nama_keahlian' => $n, 'level' => '', 'kategori' => 'Infrastruktur & alat kerja'], ['Git / GitHub','Linux','Docker','Tailscale'])
    ),
    'karya_terbaik' => [
        ['nama_karya' => 'Judol-Hunter / AI-Sentinel', 'deskripsi' => 'Deteksi web defacement, injeksi webshell, dan konten perjudian pada web institusi menggunakan ensemble learning.', 'url' => 'https://github.com/Gar07/JudolHunter', 'demo_url' => '', 'teknologi' => 'Python, LightGBM, XGBoost, CatBoost', 'peran' => 'Pengembangan aplikasi keamanan dan implementasi machine learning', 'tahun' => 2026, 'unggulan' => 1,
            'studi_kasus' => "Masalah: Mengidentifikasi perubahan berbahaya dan muatan tidak sah pada web institusi pendidikan dan pemerintah.\nPendekatan: Menggunakan LightGBM, XGBoost, dan CatBoost untuk mendukung deteksi ancaman.\nFokus implementasi: Menghubungkan pemodelan machine learning dengan kebutuhan pemeriksaan keamanan web."],
        ['nama_karya' => 'DFA Simulator & ReDoS/AI Inspector', 'deskripsi' => 'Simulator automata dengan sintesis 5-tuple berbantuan AI dan pemeriksaan Regular Expression Denial of Service.', 'url' => 'https://github.com/Gar07/DFA-Simulator', 'demo_url' => '', 'teknologi' => 'TypeScript, Automata, AI', 'peran' => 'Pengembangan simulator dan fitur inspeksi', 'tahun' => 2026, 'unggulan' => 1,
            'studi_kasus' => "Masalah: Menghubungkan konsep formal DFA dengan simulasi dan pemeriksaan ekspresi reguler.\nPendekatan: Menyediakan simulator interaktif, sintesis 5-tuple berbantuan AI, dan pemindai ReDoS.\nFokus implementasi: Memadukan teori bahasa dan automata dengan penerapan keamanan aplikasi."],
        ['nama_karya' => 'Color Blindness Corrector & Simulator', 'deskripsi' => 'Aplikasi web progresif untuk menyimulasikan dan mengoreksi tampilan warna bagi penyandang defisiensi penglihatan warna.', 'url' => 'https://github.com/Gar07/CVD', 'demo_url' => 'https://gar07.github.io/CVD/', 'teknologi' => 'WebGL, GLSL, HTML5 Canvas', 'peran' => 'Pengembangan pemrosesan visual di browser', 'tahun' => 2026, 'unggulan' => 1,
            'studi_kasus' => "Masalah: Membantu mengeksplorasi bagaimana tampilan warna dipersepsikan pada kondisi defisiensi penglihatan warna.\nPendekatan: Menggunakan WebGL, GLSL shader, dan Canvas untuk simulasi serta koreksi warna secara langsung.\nFokus implementasi: Mengolah visual dalam aplikasi web progresif."],
        ['nama_karya' => 'Veripix', 'deskripsi' => 'Analisis forensik citra dan OSINT untuk memeriksa keaslian serta metadata foto.', 'url' => 'https://github.com/Gar07/Veripix', 'demo_url' => 'https://veripix.streamlit.app/', 'teknologi' => 'Python, OpenCV, Streamlit', 'peran' => 'Pengembangan aplikasi forensik citra', 'tahun' => 2026, 'unggulan' => 1,
            'studi_kasus' => "Masalah: Mendukung verifikasi foto melalui informasi citra dan metadata yang tersedia.\nPendekatan: Menggabungkan OpenCV, analisis forensik, dan OSINT dalam antarmuka Streamlit.\nFokus implementasi: Menyajikan alat pemeriksaan gambar dalam aplikasi browser."],
        ['nama_karya' => 'Network Traffic Anomaly Detection & Observability', 'deskripsi' => 'Penelitian dan pemodelan deteksi anomali lalu lintas jaringan menggunakan Random Forest dan XGBoost.', 'url' => '', 'demo_url' => '', 'teknologi' => 'Random Forest, XGBoost, Analisis jaringan', 'peran' => 'Penelitian dan pemodelan · Juni 2026', 'tahun' => 2026, 'unggulan' => 0, 'studi_kasus' => 'Fokus pada pengenalan pola lalu lintas yang menyimpang dan observabilitas jaringan. Metrik eksperimen belum dicantumkan.'],
        ['nama_karya' => 'CyberWise', 'deskripsi' => 'Portal kesadaran keamanan siber yang dikembangkan melalui kolaborasi dengan CyberSecurity Malaysia dan Asia Pacific University.', 'url' => '', 'demo_url' => '', 'teknologi' => '', 'peran' => 'Kolaborasi pengembangan portal edukasi · Juli–November 2025', 'tahun' => 2025, 'unggulan' => 0, 'studi_kasus' => 'Kontribusi pengembangan portal web edukasi keamanan siber. Apresiasi dari CyberSecurity Malaysia dicantumkan pada bagian pencapaian.'],
        ['nama_karya' => 'Cyber Kampung', 'deskripsi' => 'Purwarupa platform kuis kompetitif dengan interaksi jaringan waktu nyata.', 'url' => '', 'demo_url' => '', 'teknologi' => 'Vue.js 3, Node.js, Express.js, MySQL, Socket.IO', 'peran' => 'Pengembangan purwarupa · Agustus–September 2025', 'tahun' => 2025, 'unggulan' => 0, 'studi_kasus' => 'Menggunakan komunikasi waktu nyata untuk mendukung sesi kuis kompetitif antarpengguna.'],
        ['nama_karya' => 'SODA-BIP', 'deskripsi' => 'Analisis perancangan arsitektur berbasis data dengan pendekatan integral parsial.', 'url' => 'https://github.com/Gar07/SODA-BIP', 'demo_url' => '', 'teknologi' => 'Three.js, React, Node.js, Express.js, TypeScript', 'peran' => 'Pengembangan platform visualisasi dan analisis · April 2025', 'tahun' => 2025, 'unggulan' => 0, 'studi_kasus' => 'Mengintegrasikan visualisasi 3D dan pengembangan web untuk mengeksplorasi perancangan arsitektur berbasis pendekatan matematika.'],
        ['nama_karya' => 'Vizin', 'deskripsi' => 'Visualisasi grafis interaktif untuk materi kalkulus dan matematika tingkat lanjut.', 'url' => 'https://github.com/Gar07/vizin', 'demo_url' => 'https://vizin.netlify.app', 'teknologi' => 'TypeScript, Visualisasi matematika', 'peran' => 'Pengembangan aplikasi visualisasi · April 2025', 'tahun' => 2025, 'unggulan' => 0, 'studi_kasus' => 'Membantu eksplorasi kalkulus melalui visualisasi fungsi dan grafik interaktif.'],
        ['nama_karya' => 'HeptaGnosis', 'deskripsi' => 'Rancangan konseptual sistem kecerdasan terpadu dengan tujuh modul logika inti.', 'url' => '', 'demo_url' => '', 'teknologi' => '', 'peran' => 'Perancangan konseptual · Mei 2025', 'tahun' => 2025, 'unggulan' => 0, 'studi_kasus' => 'Eksplorasi arsitektur penalaran modular. Ditampilkan sebagai rancangan konseptual, bukan produk yang sudah dirilis.'],
    ],
    'pencapaian' => [
        ['nama' => 'Peringkat 83 Nasional GEMASTIK 19 · Capture The Flag', 'penyelenggara' => 'GEMASTIK 19', 'jenis' => 'Prestasi', 'tahun' => 2026, 'periode' => 'Agustus 2026', 'deskripsi' => 'Bertanding solo, meraih 700 poin, dan menyelesaikan tantangan pada 5 kategori keamanan.', 'url' => ''],
        ['nama' => 'Sertifikat Apresiasi Pengembangan CyberWise', 'penyelenggara' => 'CyberSecurity Malaysia · Asia Pacific University', 'jenis' => 'Prestasi', 'tahun' => 2025, 'periode' => 'November 2025', 'deskripsi' => 'Apresiasi atas kontribusi pengembangan portal edukasi keamanan siber CyberWise.', 'url' => ''],
        ['nama' => 'Google #JuaraVibeCoding', 'penyelenggara' => 'Google', 'jenis' => 'Kegiatan', 'tahun' => 2026, 'periode' => 'Mei 2026', 'deskripsi' => 'Partisipan program eksplorasi rekayasa perangkat lunak berbantuan Google AI Studio dan natural language programming.', 'url' => ''],
        ['nama' => 'Build with AI Cloud Jakarta 2026', 'penyelenggara' => 'Build with AI Cloud Jakarta', 'jenis' => 'Kegiatan', 'tahun' => 2026, 'periode' => '2026', 'deskripsi' => 'Mengikuti kegiatan komunitas tentang komputasi awan dan implementasi model kecerdasan buatan.', 'url' => ''],
    ],
    'kontak_aktif' => [
        ['nama_media' => 'Email', 'url' => 'mailto:gar2007xtech@proton.me'], ['nama_media' => 'GitHub', 'url' => 'https://github.com/Gar07/'],
        ['nama_media' => 'LinkedIn', 'url' => 'https://www.linkedin.com/in/gar2007'], ['nama_media' => 'Instagram', 'url' => 'https://www.instagram.com/gar2007.me/'],
    ],
];
