// frontend/src/components/Biodata.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { GetUser, UpdateUser, BASE_URL, delay } from '../api/backendApi';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import Button from './Button';
import Alert from './Alert';
import Loading from './Loading';
import nofoto from '../assets/nofoto.jpg';
import {
  User, Mail, Phone, Lock, Camera, Edit3, ShieldCheck,
  Eye, EyeOff, Calendar
} from 'lucide-react';

const Biodata = ({ token }) => {
  const { setUser: setGlobalUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  const fileInputRef = useRef(null);

  const [formDataState, setFormDataState] = useState({
    nama_lengkap: '',
    bio: '',
    nama_panggilan: '', domisili: '', fokus: '', minat: '', cv: null, remove_cv: false,
    username: '',
    email: '',
    nomor_hp: '',
    password: '',
    foto: null
  });

  const fetchGetUser = useCallback(async () => {
    if (!token) return;
    setIsLoadingData(true);
    try {
      const [res] = await Promise.all([GetUser(token), delay(200)]);
      if (res.data.status === 'success' && res.data.user) {
        setProfile(res.data.user);
        setGlobalUser(res.data.user);
        setFormDataState({
          nama_lengkap: res.data.user.nama_lengkap || '',
          bio: res.data.user.bio || '',
          nama_panggilan: res.data.user.nama_panggilan || '', domisili: res.data.user.domisili || '',
          fokus: res.data.user.fokus || '', minat: res.data.user.minat || '', cv: null, remove_cv: false,
          username: res.data.user.username || '',
          email: res.data.user.email || '',
          nomor_hp: res.data.user.nomor_hp || '',
          password: '',
          foto: null
        });
      }
    } catch (err) {
      console.error(err);
      setAlert({ show: true, message: 'Gagal memuat profil admin', type: 'error' });
    } finally {
      setIsLoadingData(false);
    }
  }, [token, setGlobalUser]);

  useEffect(() => {
    fetchGetUser();
  }, [fetchGetUser]);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const handleOpenEdit = () => {
    if (!profile) return;
    setFormDataState({
      nama_lengkap: profile.nama_lengkap || '',
      bio: profile.bio || '',
      nama_panggilan: profile.nama_panggilan || '', domisili: profile.domisili || '',
      fokus: profile.fokus || '', minat: profile.minat || '', cv: null, remove_cv: false,
      username: profile.username || '',
      email: profile.email || '',
      nomor_hp: profile.nomor_hp || '',
      password: '',
      foto: null
    });
    setPreviewUrl(null);
    setShowPassword(false);
    setIsOpenModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setAlert({ show: true, message: 'Ukuran foto maksimal 5 MB!', type: 'error' });
        return;
      }
      setFormDataState((prev) => ({ ...prev, foto: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    data.append('token', token);
    data.append('nama_lengkap', formDataState.nama_lengkap);
    data.append('bio', formDataState.bio);
    for (const field of ['nama_panggilan','domisili','fokus','minat']) data.append(field, formDataState[field]);
    data.append('remove_cv', formDataState.remove_cv ? '1' : '0');
    if (formDataState.cv) data.append('cv', formDataState.cv);
    data.append('username', formDataState.username);
    data.append('email', formDataState.email);
    data.append('nomor_hp', formDataState.nomor_hp);
    if (formDataState.password !== '') {
      data.append('password', formDataState.password);
    }
    if (formDataState.foto) {
      data.append('foto', formDataState.foto);
    }

    try {
      const response = await UpdateUser(data);
      if (response.data.status === 'success') {
        setAlert({ show: true, message: 'Biodata & profil berhasil diperbarui!', type: 'success' });
        setIsOpenModal(false);
        fetchGetUser();
      } else {
        setAlert({ show: true, message: response.data.message || 'Gagal memperbarui profil', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setAlert({
        show: true,
        message: err.response?.data?.message || 'Gagal memperbarui profil',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFotoUrl = (fotoName) => {
    if (!fotoName) return nofoto;
    if (fotoName.startsWith('http')) return fotoName;
    return `${BASE_URL}/uploads/${fotoName}`;
  };

  if (isLoadingData) {
    return <Loading type="inline" title="Memuat biodata profil..." />;
  }

  return (
    <div className="biodata-container">
      <div className="section-header">
        <div>
          <h3 className="section-title">Profil & Biodata Administrator</h3>
          <p className="section-subtitle">Kelola informasi publik dan foto identitas portofolio Anda</p>
        </div>
        <Button
          primary={true}
          text="Edit Biodata"
          icon={<Edit3 size={16} />}
          onClick={handleOpenEdit}
          type="button"
        />
      </div>

      <div className="biodata-card-content">
        <div className="biodata-avatar-column">
          <div className="avatar-frame">
            <img
              src={getFotoUrl(profile?.foto)}
              alt={profile?.nama_lengkap || "Foto Profil"}
              onError={(e) => { e.target.src = nofoto; }}
              className="avatar-img"
            />
            <button
              type="button"
              className="avatar-quick-edit"
              onClick={handleOpenEdit}
              title="Ganti Foto"
            >
              <Camera size={16} />
            </button>
          </div>
          <div className="avatar-badge">
            <ShieldCheck size={14} /> Administrator Aktif
          </div>
        </div>

        <div className="biodata-info-grid">
          <div className="info-item">
            <span className="info-label"><User size={15} /> Nama Lengkap</span>
            <span className="info-value primary-bold">{profile?.nama_lengkap || "-"}</span>
          </div>

          <div className="info-item">
            <span className="info-label"><ShieldCheck size={15} /> Username</span>
            <span className="info-value font-mono">@{profile?.username || "-"}</span>
          </div>

          <div className="info-item">
            <span className="info-label"><Mail size={15} /> Email</span>
            <span className="info-value">{profile?.email || "-"}</span>
          </div>

          <div className="info-item">
            <span className="info-label"><Phone size={15} /> Nomor HP / WhatsApp</span>
            <span className="info-value">{profile?.nomor_hp || "-"}</span>
          </div>

          <div className="info-item">
            <span className="info-label"><Calendar size={15} /> Terdaftar Sejak</span>
            <span className="info-value">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric'
              }) : '-'}
            </span>
          </div>
          <div className="info-item bio-info">
            <span className="info-label">Bio singkat publik</span>
            <p className="info-value">{profile?.bio || 'Belum diisi'}</p>
          </div>
          <div className="info-item"><span className="info-label">Nama panggilan · Domisili</span><span className="info-value">{profile?.nama_panggilan || '—'} · {profile?.domisili || '—'}</span></div>
          {profile?.cv && <div className="info-item"><span className="info-label">CV PDF publik</span><a className="text-link" href={`${BASE_URL}/uploads/${profile.cv}`} download>Unduh CV saat ini</a></div>}
        </div>
      </div>

      {/* Modal Edit Biodata */}
      <Modal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        title="Edit Biodata Profil"
        subtitle="Perbarui informasi data diri dan unggah foto profil terbaru"
        isLoading={isSubmitting}
        loadingTitle="Menyimpan perubahan profil..."
      >
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Foto Preview & Upload */}
          <div className="form-avatar-section">
            <div className="form-avatar-preview">
              <img
                src={previewUrl || getFotoUrl(profile?.foto)}
                alt="Preview"
                onError={(e) => { e.target.src = nofoto; }}
              />
            </div>
            <div className="form-avatar-actions">
              <label className="button secondary button-file-label">
                <Camera size={16} />
                <span>Pilih Foto Baru</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
              <small className="help-text">Format: JPG, PNG, WEBP (Maks 5 MB)</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="biodata-field-1"><User size={14} /> Nama Lengkap *</label>
              <input id="biodata-field-1"
                type="text"
                required
                value={formDataState.nama_lengkap}
                onChange={(e) => setFormDataState({ ...formDataState, nama_lengkap: e.target.value })}
                placeholder="Gilbert Aldrich Rumahorbo"
              />
            </div>

            <div className="form-group">
              <label htmlFor="biodata-field-2"><ShieldCheck size={14} /> Username Akun *</label>
              <input id="biodata-field-2"
                type="text"
                required
                value={formDataState.username}
                onChange={(e) => setFormDataState({ ...formDataState, username: e.target.value })}
                placeholder="cth. admin"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="biodata-field-3"><Mail size={14} /> Alamat Email *</label>
              <input id="biodata-field-3"
                type="email"
                required
                value={formDataState.email}
                onChange={(e) => setFormDataState({ ...formDataState, email: e.target.value })}
                placeholder="cth. admin@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="biodata-field-4"><Phone size={14} /> Nomor Telepon / HP (opsional)</label>
              <input id="biodata-field-4"
                type="text"
                value={formDataState.nomor_hp}
                onChange={(e) => setFormDataState({ ...formDataState, nomor_hp: e.target.value })}
                placeholder="Kosongkan jika tidak ingin ditampilkan"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group"><label htmlFor="profile-nickname">Nama panggilan</label><input id="profile-nickname" maxLength={80} value={formDataState.nama_panggilan} onChange={e => setFormDataState({ ...formDataState, nama_panggilan: e.target.value })} /></div>
            <div className="form-group"><label htmlFor="profile-location">Domisili publik</label><input id="profile-location" maxLength={160} value={formDataState.domisili} onChange={e => setFormDataState({ ...formDataState, domisili: e.target.value })} placeholder="Kota, provinsi" /></div>
          </div>
          <div className="form-group">
            <label htmlFor="biodata-bio">Bio singkat</label>
            <textarea id="biodata-bio" rows={4} maxLength={500} value={formDataState.bio}
              aria-describedby="biodata-bio-help"
              onChange={e => setFormDataState({ ...formDataState, bio: e.target.value })}
              placeholder="Ceritakan minat, fokus belajar, atau hal yang ingin Anda kerjakan." />
            <p id="biodata-bio-help" className="help-text">Ditampilkan di bagian Tentang pada portofolio. {formDataState.bio.length}/500 karakter.</p>
          </div>
          <div className="form-group"><label htmlFor="profile-focus">Fokus utama</label><textarea id="profile-focus" rows={4} maxLength={500} value={formDataState.fokus} onChange={e => setFormDataState({ ...formDataState, fokus: e.target.value })} /><p className="help-text">Satu fokus per baris. Gunakan bidang yang ingin Anda tekuni.</p></div>
          <div className="form-group"><label htmlFor="profile-interest">Minat di luar komputasi</label><textarea id="profile-interest" rows={3} maxLength={500} value={formDataState.minat} onChange={e => setFormDataState({ ...formDataState, minat: e.target.value })} /></div>
          <div className="form-group"><label htmlFor="profile-cv">Ganti CV PDF</label><input id="profile-cv" type="file" accept="application/pdf,.pdf" onChange={e => {
            const file = e.target.files[0];
            if (file && file.size > 5 * 1024 * 1024) { setAlert({ show: true, type: 'error', message: 'Ukuran CV maksimal 5 MB.' }); e.target.value = ''; return; }
            setFormDataState({ ...formDataState, cv: file || null, remove_cv: false });
          }} /><p className="help-text">PDF maksimal 5 MB. CV dapat diunduh pengunjung; periksa isinya sebelum mengunggah. PDF tidak berubah otomatis ketika data web diedit.</p>
          {profile?.cv && <label className="checkbox-field"><input type="checkbox" checked={formDataState.remove_cv} onChange={e => setFormDataState({ ...formDataState, remove_cv: e.target.checked })} />Hapus tautan CV publik saat disimpan</label>}</div>

          <div className="form-group">
            <label htmlFor="biodata-field-5"><Lock size={14} /> Kata Sandi Baru (Kosongkan jika tidak diubah)</label>
            <div className="input-with-action">
              <input id="biodata-field-5"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                minLength={12}
                maxLength={72}
                value={formDataState.password}
                onChange={(e) => setFormDataState({ ...formDataState, password: e.target.value })}
                placeholder="Masukkan kata sandi baru jika ingin mengganti"
              />
              <button
                type="button"
                className="input-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Sembunyikan password baru' : 'Tampilkan password baru'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="help-text">Password baru 12–72 byte. Sesi pada perangkat lain akan berakhir.</p>
          </div>

          <div className="form-actions">
            <Button
              primary={false}
              text="Batal"
              type="button"
              onClick={() => setIsOpenModal(false)}
              disabled={isSubmitting}
            />
            <Button
              primary={true}
              text="Simpan Perubahan"
              type="submit"
              disabled={isSubmitting}
            />
          </div>
        </form>
      </Modal>

      <Alert alert={alert} setAlert={setAlert} />
    </div>
  );
};

export default Biodata;
