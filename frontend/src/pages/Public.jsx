import { safeLink } from '../utils/safeLink';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, ArrowUpRight, Copy, ChevronUp, Search, Printer, Download } from 'lucide-react';
import { GetPublic, BASE_URL } from '../api/backendApi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { formatPeriod } from '../utils/formatPeriod';
import { SKILL_LEVELS, SKILL_CATEGORIES, getSkillLevel } from '../utils/skillLevels';
import nofoto from '../assets/nofoto.jpg';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import { getSocialIcon } from '../components/SocialIcons';

const currentYear = new Date().getFullYear();

export default function Public() {
  const { token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [history, setHistory] = useState('all');
  const [skillLevel, setSkillLevel] = useState('all');
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [alert, setAlert] = useState({ show: false });
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let active = true;
    GetPublic().then(({ data: response }) => {
      if (!active) return;
      if (response.status !== 'success') throw new Error('Portfolio unavailable');
      setData(response.data);
      document.title = `${response.data.profil?.nama_lengkap || 'Portofolio'} · Portofolio`;
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    let closed = [];
    const beforePrint = () => {
      closed = [...document.querySelectorAll('.portfolio-page details:not([open])')];
      closed.forEach(detail => { detail.open = true; });
    };
    const afterPrint = () => closed.forEach(detail => { detail.open = false; });
    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);
    return () => {
      window.removeEventListener('beforeprint', beforePrint);
      window.removeEventListener('afterprint', afterPrint);
    };
  }, []);

  const copy = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      setAlert({ show: true, type: 'success', message: 'Kontak berhasil disalin.' });
    } catch {
      setAlert({ show: true, type: 'error', message: 'Tidak dapat menyalin. Silakan gunakan tautan email di bagian kontak.' });
    }
  };

  if (error) return (
    <main className="error-container container">
      <h1>Portofolio belum dapat dimuat.</h1>
      <p>Silakan coba kembali beberapa saat lagi.</p>
      <button className="button primary" onClick={() => window.location.reload()}>Coba lagi</button>
    </main>
  );
  if (!data) return <Loading title="Memuat portofolio…" />;

  const { profil = {}, riwayat_pendidikan: education = [], pengalaman: experience = [],
    keahlian: skills = [], karya_terbaik: projects = [], kontak_aktif: contacts = [], pencapaian: achievements = [] } = data;
  const study = education.find(item => Number(item.tahun_selesai) === 0) || education[0];
  const photo = !profil.foto ? nofoto : profil.foto.startsWith('https://')
    ? profil.foto : `${BASE_URL}/uploads/${profil.foto}`;
  const hasFeatured = projects.some(item => Number(item.unggulan) === 1);
  const filtered = projects.filter(item =>
    (search.trim() || showAllProjects || !hasFeatured || Number(item.unggulan) === 1) &&
    `${item.nama_karya} ${item.deskripsi} ${item.teknologi || ''}`.toLowerCase().includes(search.trim().toLowerCase()));
  const visibleSkills = skills.filter(item => skillLevel === 'all' || getSkillLevel(item.level).value === skillLevel);
  const categories = [...new Set([...SKILL_CATEGORIES, ...skills.map(item => item.kategori || 'Lainnya')])]
    .filter(category => skills.some(item => (item.kategori || 'Lainnya') === category));
  const initials = (profil.nama_lengkap || 'Portofolio').split(' ').slice(0, 2).map(word => word[0]).join('');

  return (
    <div className="portfolio-page">
      <a className="skip-link" href="#main">Lewati navigasi</a>
      <header className="portfolio-navbar">
        <div className="nav-container">
          <a href="#tentang" className="nav-brand-link"><span className="brand-mark">{initials}</span><span>{(profil.nama_lengkap || 'Portofolio').split(' ').map((word, index) => index === 0 ? word : `${word[0]}.`).slice(0, 2).join(' ')}</span></a>
          <nav className="public-nav" aria-label="Navigasi utama">
            <a href="#proyek">Proyek</a><a href="#riwayat">Riwayat</a><a href="#keahlian">Keahlian</a><a href="#pencapaian">Pencapaian</a><a href="#kontak">Kontak</a>
          </nav>
          <button className="button button-icon-only" onClick={toggleTheme} aria-label={theme === 'light' ? 'Aktifkan mode gelap' : 'Aktifkan mode terang'}>
            {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
          </button>
        </div>
      </header>

      <main id="main" className="container">
        <section id="tentang" className="profile-hero">
          <div className="hero-copy">
            {profil.nama_panggilan && <p className="hero-eyebrow">{profil.nama_panggilan}</p>}
            <h1>{profil.nama_lengkap || 'Portofolio pribadi'}</h1>
            {study && <p className="hero-study">Mahasiswa {study.jurusan}<br /><span>{study.nama_institusi}</span></p>}
            {profil.bio && <p className="hero-intro">{profil.bio}</p>}
            {profil.domisili && <p className="hero-location">{profil.domisili}</p>}
            {profil.fokus && <ul className="focus-list" aria-label="Fokus dan minat profesional">{profil.fokus.split('\n').filter(line => line.trim()).map((line, index) => <li key={index}>{line}</li>)}</ul>}
            <p className="print-contact-details">{profil.email}{profil.nomor_hp && <><br />{profil.nomor_hp}</>}</p>
            <div className="hero-actions"><a href="#proyek" className="button primary">Lihat proyek</a>{profil.cv ? <a href={`${BASE_URL}/uploads/${profil.cv}`} className="button secondary" download><Download size={16} />Unduh CV <span className="sr-only">PDF</span></a> : <a href="#kontak" className="button secondary">Hubungi saya</a>}</div>
            <button type="button" className="print-portfolio text-link" onClick={() => window.print()}><Printer size={16} />Cetak / simpan PDF</button>
          </div>
          <div className="hero-portrait">
            <img src={photo} alt={`Foto profil ${profil.nama_lengkap}`} width="320" height="320" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = nofoto; }} />
            {profil.email && <button className="contact-copy" onClick={() => copy(profil.email)} aria-label={`Salin email ${profil.email}`}><span>{profil.email}</span><Copy size={17} /></button>}
            {profil.nomor_hp && <button className="contact-copy" onClick={() => copy(profil.nomor_hp)} aria-label={`Salin nomor telepon ${profil.nomor_hp}`}><span>{profil.nomor_hp}</span><Copy size={17} /></button>}
          </div>
        </section>

        <section id="proyek" className="public-section">
          <div className="public-section-heading">
            <div><h2>Proyek pilihan</h2><p className="section-subtitle">Eksplorasi dari keamanan siber hingga aplikasi visual interaktif.</p></div>
            <div className="search-input-wrapper"><Search size={17} className="search-icon" /><input type="search" className="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari proyek atau teknologi…" aria-label="Cari proyek atau teknologi" /></div>
          </div>
          <div className="project-list">
            {projects.map(item => <article className="project-row" key={item.id} hidden={!filtered.includes(item)}>
              <div><h3>{item.nama_karya}</h3>{Number(item.tahun) > 0 && <p className="project-year">{item.tahun}</p>}{item.peran && <p className="project-role">{item.peran}</p>}</div>
              <div><p>{item.deskripsi}</p>
                {item.teknologi && <ul className="tech-tags" aria-label="Teknologi proyek">{item.teknologi.split(',').filter(tech => tech.trim()).map((tech, index) => <li key={index}>{tech.trim()}</li>)}</ul>}
                <div className="project-links">{item.url && <a href={safeLink(item.url)} target="_blank" rel="noreferrer" className="text-link">Kode sumber <ArrowUpRight size={16} /><span className="sr-only"> {item.nama_karya} (tab baru)</span></a>}{item.demo_url && <a href={safeLink(item.demo_url)} target="_blank" rel="noreferrer" className="text-link">Live demo <ArrowUpRight size={16} /><span className="sr-only"> {item.nama_karya} (tab baru)</span></a>}</div>
                {item.studi_kasus && <details className="project-case"><summary>Masalah & pendekatan<span className="sr-only"> {item.nama_karya}</span></summary><p>{item.studi_kasus}</p></details>}
              </div>
            </article>)}
            {!filtered.length && <p className="empty-state" role="status">{search ? 'Tidak ada proyek yang cocok. Coba kata lain.' : 'Proyek akan ditampilkan di sini.'}</p>}
          </div>
          <div className="project-controls"><p role="status">{filtered.length} dari {projects.length} proyek{search.trim() ? ' cocok dengan pencarian.' : ' ditampilkan.'}</p>{hasFeatured && <button className="button secondary" aria-pressed={showAllProjects} onClick={() => { setShowAllProjects(!showAllProjects); setSearch(''); }}>{showAllProjects ? 'Hanya proyek pilihan' : `Lihat semua proyek (${projects.length})`}</button>}</div>
        </section>

        <section id="riwayat" className="public-section">
          <h2>Riwayat</h2>
          <div className="history-filters" aria-label="Filter riwayat">
            {[['all', 'Semua'], ['education', 'Pendidikan'], ['experience', 'Pengalaman']].map(([value, label]) => <button key={value} className={`button ${history === value ? 'primary' : 'secondary'}`} aria-pressed={history === value} onClick={() => setHistory(value)}>{label}</button>)}
          </div>
          {education.map(item => <article className="history-row" key={`edu-${item.id}`} hidden={history === 'experience'}><div><h3>{item.nama_institusi}</h3><p>{item.tingkat} · {item.jurusan}</p></div><p>{formatPeriod(item.tahun_mulai, item.tahun_selesai)}</p></article>)}
          {experience.map(item => <article className="history-row" key={`exp-${item.id}`} hidden={history === 'education'}><div><h3>{item.jabatan}</h3><p>{item.nama_perusahaan}</p>{item.deskripsi && <p className="experience-description">{item.deskripsi}</p>}</div><p>{item.periode || formatPeriod(item.tahun_mulai, item.tahun_selesai, 'Periode belum dicantumkan')}</p></article>)}
          {((history === 'education' && !education.length) || (history === 'experience' && !experience.length) || (!education.length && !experience.length)) && <p className="empty-state">Belum ada riwayat {history === 'experience' ? 'pengalaman' : 'pendidikan'} yang ditambahkan.</p>}
        </section>

        <section id="keahlian" className="public-section technology-section">
          <div className="public-section-heading">
            <div><h2>Keahlian & teknologi</h2><p className="section-subtitle">Penilaian mandiri untuk memberi gambaran kemampuan saya saat ini.</p></div>
            <div className="skill-filter"><label htmlFor="skill-level-filter">Tampilkan level</label><select id="skill-level-filter" value={skillLevel} onChange={e => setSkillLevel(e.target.value)}>
              <option value="all">Semua level</option>
              <option value="">Belum dinilai</option>
              {SKILL_LEVELS.map(level => <option key={level.value} value={level.value}>{level.value} ({level.label})</option>)}
            </select></div>
          </div>
          <details className="skill-guide">
            <summary>Bagaimana level ini diartikan?</summary>
            <dl>{SKILL_LEVELS.map(level => <div key={level.value}><dt>{level.value} · {level.label}</dt><dd>{level.description}</dd></div>)}</dl>
            <p className="help-text">Level ini merupakan penilaian pribadi, bukan sertifikasi atau persentase penguasaan.</p>
            <p className="help-text">Belum dinilai: teknologi yang digunakan atau dipelajari, dengan tingkat kemahiran yang belum ditentukan.</p>
          </details>
          {categories.map(category => <div className="skill-group" key={category} hidden={!visibleSkills.some(item => (item.kategori || 'Lainnya') === category)}>
          <h3 className="skill-category">{category}</h3>
          <ul className="skill-list">{skills.filter(item => (item.kategori || 'Lainnya') === category).map(item => {
            const level = getSkillLevel(item.level);
            return <li key={item.id} hidden={skillLevel !== 'all' && level.value !== skillLevel}>
              <h4>{item.nama_keahlian}</h4><span className="badge-level">{level.value ? `${level.value} · ${level.label}` : level.label}</span>
            </li>;
          })}</ul></div>)}
          <p className="skill-result-count" role="status">{visibleSkills.length} dari {skills.length} keahlian ditampilkan.</p>
          {!visibleSkills.length && <p className="empty-state">{skills.length ? 'Belum ada keahlian pada level ini. Pilih level lain.' : 'Keahlian belum ditambahkan.'}</p>}
        </section>
        <section id="pencapaian" className="public-section">
          <div className="public-section-heading"><div><h2>Pencapaian & kegiatan</h2><p className="section-subtitle">Kompetisi, apresiasi, dan ruang belajar di luar perkuliahan.</p></div></div>
          {achievements.map(item => <article className="achievement-row" key={item.id}>
            <div className="achievement-meta"><span className="badge-level">{item.jenis}</span><p>{item.periode || item.tahun || ''}</p></div>
            <div><h3>{item.nama}</h3><p className="achievement-organizer">{item.penyelenggara}</p>{item.deskripsi && <p>{item.deskripsi}</p>}{item.url && <a className="text-link" href={safeLink(item.url)} target="_blank" rel="noreferrer">Lihat bukti <ArrowUpRight size={16} /><span className="sr-only"> {item.nama} (tab baru)</span></a>}</div>
          </article>)}
          {!achievements.length && <p className="empty-state">Pencapaian belum ditambahkan.</p>}
          {profil.minat && <aside className="personal-interest"><h3>Di luar komputasi</h3><p>{profil.minat}</p></aside>}
        </section>
        <section id="kontak" className="public-section contact-section">
          <h2>Mari terhubung.</h2><p>Saya terbuka untuk berdiskusi, berkolaborasi, atau sekadar menyapa.</p>
          <div className="contact-links">{contacts.map(item => <a key={item.id} href={safeLink(item.url)} target="_blank" rel="noreferrer">{getSocialIcon(item.nama_media, 18)}<span>{item.nama_media === 'Email' ? profil.email : item.nama_media}</span><span className="sr-only"> (tab baru)</span></a>)}</div>
        </section>
      </main>
      <footer className="public-footer container"><p>© {currentYear} {profil.nama_lengkap}</p><Link to={token ? '/dashboard' : '/login'}>{token ? 'Panel admin' : 'Gar2007'}</Link></footer>
      {showTop && <button className="back-to-top-btn" aria-label="Kembali ke atas" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}><ChevronUp size={20} /></button>}
      <Alert alert={alert} setAlert={setAlert} />
    </div>
  );
}
