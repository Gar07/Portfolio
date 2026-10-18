// frontend/src/components/Pengalaman.jsx
import { useState, useEffect, useCallback } from 'react';
import { GetPengalaman, AddPengalaman, UpdatePengalaman, DeletePengalaman, delay } from '../api/backendApi';
import Modal from './Modal';
import Button from './Button';
import Alert from './Alert';
import Loading from './Loading';
import { formatPeriod } from '../utils/formatPeriod';
import {
  Briefcase, Plus, Edit2, Trash2, Search, Calendar, Building, UserCheck
} from 'lucide-react';

const Pengalaman = ({ token }) => {
  const [list, setList] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({
    nama_perusahaan: '',
    jabatan: '',
    tahun_mulai: '', tahun_selesai: '', periode: '', deskripsi: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, title: '' });

  const fetchData = useCallback(async () => {
    if (!token) return;
    setIsLoadingData(true);
    try {
      const [res] = await Promise.all([GetPengalaman(token), delay(200)]);
      if (res.data.status === 'success') {
        setList(res.data.pengalaman || []);
      }
    } catch (err) {
      console.error(err);
      setAlert({ show: true, message: 'Gagal mengambil data pengalaman kerja', type: 'error' });
    } finally {
      setIsLoadingData(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAdd = () => {
    setIsEdit(false);
    setCurrentId(null);
    setForm({
      nama_perusahaan: '',
      jabatan: '',
      tahun_mulai: '', tahun_selesai: '', periode: '', deskripsi: ''
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (item) => {
    setIsEdit(true);
    setCurrentId(item.id);
    setForm({
      nama_perusahaan: item.nama_perusahaan || '',
      jabatan: item.jabatan || '',
      tahun_mulai: item.tahun_mulai || '', tahun_selesai: item.tahun_selesai || '',
      periode: item.periode || '', deskripsi: item.deskripsi || ''
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        tahun_mulai: Number(form.tahun_mulai),
        tahun_selesai: Number(form.tahun_selesai),
        token
      };

      if (isEdit) {
        payload.id = currentId;
        await UpdatePengalaman(payload);
        setAlert({ show: true, message: 'Pengalaman kerja berhasil diperbarui!', type: 'success' });
      } else {
        await AddPengalaman(payload);
        setAlert({ show: true, message: 'Pengalaman kerja berhasil ditambahkan!', type: 'success' });
      }
      setIsOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setAlert({ show: true, message: err.response?.data?.message || 'Gagal menyimpan pengalaman kerja', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (item) => {
    setDeleteConfirm({
      isOpen: true,
      id: item.id,
      title: `${item.jabatan} di ${item.nama_perusahaan}`
    });
  };

  const executeDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await DeletePengalaman(deleteConfirm.id, token);
      setAlert({ show: true, message: 'Pengalaman berhasil dihapus!', type: 'success' });
      setDeleteConfirm({ isOpen: false, id: null, title: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      setAlert({ show: true, message: 'Gagal menghapus pengalaman', type: 'error' });
    }
  };

  const filteredList = list.filter((item) =>
    item.nama_perusahaan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.jabatan?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="crud-section">
      <div className="section-header">
        <div>
          <h3 className="section-title"><Briefcase className="inline-icon" size={20} /> Pengalaman Kerja & Organisasi</h3>
          <p className="section-subtitle">Riwayat karier profesional, magang, dan kontribusi organisasi</p>
        </div>
        <Button
          primary={true}
          text="Tambah Pengalaman"
          icon={<Plus size={16} />}
          onClick={handleOpenAdd}
          type="button"
        />
      </div>

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Cari perusahaan atau posisi jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="badge-count">
          Total: <strong>{list.length}</strong> Pengalaman
        </div>
      </div>

      {isLoadingData ? (
        <Loading type="inline" title="Memuat riwayat pengalaman..." />
      ) : filteredList.length === 0 ? (
        <div className="empty-state">
          <Briefcase size={48} className="empty-icon" />
          <h4>Belum Ada Data Pengalaman</h4>
          <p>{searchQuery ? 'Tidak ditemukan data yang cocok.' : 'Tambahkan rekam jejak pekerjaan Anda untuk melengkapi portofolio.'}</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>No</th>
                <th>Perusahaan / Instansi</th>
                <th>Jabatan / Posisi</th>
                <th>Periode Tahun</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item, index) => (
                <tr key={item.id}>
                  <td className="text-center font-mono">{index + 1}</td>
                  <td>
                    <div className="table-item-primary">
                      <Building size={16} className="table-item-icon" />
                      <span>{item.nama_perusahaan}</span>
                    </div>
                  </td>
                  <td>
                    <div className="table-item-secondary">
                      <UserCheck size={14} />
                      <strong className="text-accent">{item.jabatan}</strong>
                    </div>
                  </td>
                  <td>
                    <div className="table-item-year">
                      <Calendar size={14} />
                      <span>{item.periode || formatPeriod(item.tahun_mulai, item.tahun_selesai, 'Belum dicantumkan')}</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit data"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => confirmDelete(item)}
                        title="Hapus data"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Tambah/Edit */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={isEdit ? 'Edit Pengalaman Kerja' : 'Tambah Pengalaman Baru'}
        subtitle="Masukkan nama perusahaan dan posisi jabatan"
        isLoading={isSubmitting}
        loadingTitle="Menyimpan pengalaman..."
      >
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="pengalaman-field-1"><Building size={14} /> Nama Perusahaan / Organisasi *</label>
            <input id="pengalaman-field-1"
              type="text"
              required
              value={form.nama_perusahaan}
              onChange={(e) => setForm({ ...form, nama_perusahaan: e.target.value })}
              placeholder="cth. PT Inovasi Digital"
            />
          </div>

          <div className="form-group">
            <label htmlFor="pengalaman-field-2"><UserCheck size={14} /> Posisi / Jabatan *</label>
            <input id="pengalaman-field-2"
              type="text"
              required
              value={form.jabatan}
              onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
              placeholder="cth. Lead Software Engineer"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pengalaman-field-3"><Calendar size={14} /> Tahun Mulai (opsional)</label>
              <input id="pengalaman-field-3"
                type="number"
                min="1950"
                max="2099"
                value={form.tahun_mulai}
                onChange={(e) => setForm({ ...form, tahun_mulai: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="pengalaman-field-4"><Calendar size={14} /> Tahun Selesai (kosong jika berjalan)</label>
              <input id="pengalaman-field-4"
                type="number"
                min="1950"
                max="2099"
                value={form.tahun_selesai}
                onChange={(e) => setForm({ ...form, tahun_selesai: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group"><label htmlFor="experience-period">Periode lengkap</label><input id="experience-period" maxLength={80} value={form.periode} onChange={e => setForm({ ...form, periode: e.target.value })} placeholder="Mei 2026 – Sekarang" /><p className="help-text">Jika diisi, teks ini ditampilkan menggantikan rentang tahun.</p></div>
          <div className="form-group"><label htmlFor="experience-description">Tanggung jawab / kontribusi</label><textarea id="experience-description" rows={4} maxLength={3000} value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} /></div>
          <div className="form-actions">
            <Button primary={false} text="Batal" type="button" onClick={() => setIsOpen(false)} />
            <Button primary={true} text={isEdit ? 'Simpan Perubahan' : 'Tambah Sekarang'} type="submit" disabled={isSubmitting} />
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal for Delete */}
      <Modal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null, title: '' })}
        title="Konfirmasi Hapus"
        maxWidth="440px"
      >
        <div className="delete-dialog-body">
          <p>Apakah Anda yakin ingin menghapus data pengalaman kerja berikut?</p>
          <div className="delete-target-card">
            <strong>{deleteConfirm.title}</strong>
          </div>
          <p className="text-muted-small">Data yang dihapus tidak dapat dipulihkan.</p>
          <div className="form-actions mt-4">
            <Button primary={false} text="Batal" type="button" onClick={() => setDeleteConfirm({ isOpen: false, id: null, title: '' })} />
            <button className="button button-danger" type="button" onClick={executeDelete}>
              Ya, Hapus Data
            </button>
          </div>
        </div>
      </Modal>

      <Alert alert={alert} setAlert={setAlert} />
    </div>
  );
};

export default Pengalaman;
