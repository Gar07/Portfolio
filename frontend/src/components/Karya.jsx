import { safeLink } from '../utils/safeLink';
// frontend/src/components/Karya.jsx
import { useState, useEffect, useCallback } from 'react';
import { GetKarya, AddKarya, UpdateKarya, DeleteKarya, delay } from '../api/backendApi';
import Modal from './Modal';
import Button from './Button';
import Alert from './Alert';
import Loading from './Loading';
import {
  FolderGit2, Plus, Edit2, Trash2, Search, ExternalLink, Globe, Layers
} from 'lucide-react';

const emptyForm = { nama_karya: '', deskripsi: '', url: '', demo_url: '', teknologi: '', peran: '', studi_kasus: '', tahun: '', unggulan: 0 };
const Karya = ({ token }) => {
  const [list, setList] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, title: '' });

  const fetchData = useCallback(async () => {
    if (!token) return;
    setIsLoadingData(true);
    try {
      const [res] = await Promise.all([GetKarya(token), delay(200)]);
      if (res.data.status === 'success') {
        setList(res.data.karya_terbaik || []);
      }
    } catch (err) {
      console.error(err);
      setAlert({ show: true, message: 'Gagal mengambil data karya', type: 'error' });
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
    setForm(emptyForm);
    setIsOpen(true);
  };

  const handleOpenEdit = (item) => {
    setIsEdit(true);
    setCurrentId(item.id);
    setForm({
      nama_karya: item.nama_karya || '',
      deskripsi: item.deskripsi || '',
      url: item.url || '',
      demo_url: item.demo_url || '', teknologi: item.teknologi || '', peran: item.peran || '',
      studi_kasus: item.studi_kasus || '', tahun: item.tahun || '', unggulan: Number(item.unggulan) || 0
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...form, tahun: Number(form.tahun), token };
      if (isEdit) {
        payload.id = currentId;
        await UpdateKarya(payload);
        setAlert({ show: true, message: 'Karya berhasil diperbarui!', type: 'success' });
      } else {
        await AddKarya(payload);
        setAlert({ show: true, message: 'Karya berhasil ditambahkan!', type: 'success' });
      }
      setIsOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setAlert({ show: true, message: err.response?.data?.message || 'Gagal menyimpan karya', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (item) => {
    setDeleteConfirm({
      isOpen: true,
      id: item.id,
      title: item.nama_karya
    });
  };

  const executeDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await DeleteKarya(deleteConfirm.id, token);
      setAlert({ show: true, message: 'Karya berhasil dihapus!', type: 'success' });
      setDeleteConfirm({ isOpen: false, id: null, title: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      setAlert({ show: true, message: 'Gagal menghapus karya', type: 'error' });
    }
  };

  const filteredList = list.filter((item) =>
    item.nama_karya?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="crud-section">
      <div className="section-header">
        <div>
          <h3 className="section-title"><FolderGit2 className="inline-icon" size={20} /> Karya Terbaik & Portofolio Proyek</h3>
          <p className="section-subtitle">Daftar proyek unggulan, aplikasi web, dan repositori open-source</p>
        </div>
        <Button
          primary={true}
          text="Tambah Karya"
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
            placeholder="Cari judul proyek atau deskripsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="badge-count">
          Total: <strong>{list.length}</strong> Proyek
        </div>
      </div>

      {isLoadingData ? (
        <Loading type="inline" title="Memuat karya..." />
      ) : filteredList.length === 0 ? (
        <div className="empty-state">
          <FolderGit2 size={48} className="empty-icon" />
          <h4>Belum Ada Karya yang Ditambahkan</h4>
          <p>{searchQuery ? 'Tidak ada proyek yang sesuai dengan kata kunci pencarian.' : 'Pamerkan hasil karya aplikasi dan portofolio Anda di sini.'}</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>No</th>
                <th style={{ minWidth: '200px' }}>Nama Karya</th>
                <th>Deskripsi Singkat</th>
                <th style={{ width: '130px' }}>Tautan Proyek</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item, index) => (
                <tr key={item.id}>
                  <td className="text-center font-mono">{index + 1}</td>
                  <td>
                    <div className="table-item-primary">
                      <Layers size={16} className="table-item-icon" />
                      <strong>{item.nama_karya}</strong>
                    </div>
                  </td>
                  <td>
                    <p className="table-description-text">{item.deskripsi}</p>
                  </td>
                  <td>
                    {item.url ? (
                      <a
                        href={safeLink(item.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="table-link"
                      >
                        <Globe size={13} />
                        <span>Kunjungi</span>
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-muted-small">-</span>
                    )}
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
        title={isEdit ? 'Edit Karya Portofolio' : 'Tambah Karya Baru'}
        subtitle="Bagikan tautan demo atau repositori karya terbaik Anda"
        isLoading={isSubmitting}
        loadingTitle="Menyimpan karya..."
      >
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="karya-field-1"><Layers size={14} /> Nama Karya / Proyek *</label>
            <input id="karya-field-1"
              type="text"
              required
              value={form.nama_karya}
              onChange={(e) => setForm({ ...form, nama_karya: e.target.value })}
              placeholder="cth. Aplikasi TaskFlow Pro"
            />
          </div>

          <div className="form-group">
            <label htmlFor="karya-field-2"><FolderGit2 size={14} /> Deskripsi Karya *</label>
            <textarea id="karya-field-2"
              required
              rows={4} maxLength={2000}
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              placeholder="Jelaskan fitur utama, teknologi yang dipakai, dan peran Anda..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="karya-field-3"><Globe size={14} /> URL repositori / kode sumber</label>
            <input id="karya-field-3"
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://github.com/username/project atau https://demo.com"
            />
          </div>

          <div className="form-row">
            <div className="form-group"><label htmlFor="project-year">Tahun proyek</label><input id="project-year" type="number" min="1950" max="2099" value={form.tahun} onChange={e => setForm({ ...form, tahun: e.target.value })} /></div>
            <div className="form-group"><label htmlFor="project-demo">URL live demo (opsional)</label><input id="project-demo" type="url" maxLength={1000} value={form.demo_url} onChange={e => setForm({ ...form, demo_url: e.target.value })} placeholder="https://..." /></div>
          </div>
          <div className="form-group"><label htmlFor="project-tech">Teknologi</label><input id="project-tech" maxLength={500} value={form.teknologi} onChange={e => setForm({ ...form, teknologi: e.target.value })} placeholder="Python, OpenCV, Streamlit" /><p className="help-text">Pisahkan dengan koma. Cantumkan teknologi yang benar-benar digunakan.</p></div>
          <div className="form-group"><label htmlFor="project-role">Peran / kontribusi Anda</label><input id="project-role" maxLength={300} value={form.peran} onChange={e => setForm({ ...form, peran: e.target.value })} /></div>
          <div className="form-group"><label htmlFor="project-case">Studi kasus singkat</label><textarea id="project-case" rows={6} maxLength={5000} value={form.studi_kasus} onChange={e => setForm({ ...form, studi_kasus: e.target.value })} placeholder={'Masalah: ...\nPendekatan: ...\nKontribusi / hasil yang dapat dibuktikan: ...'} /><p className="help-text">Jelaskan masalah, alasan pendekatan, dan kontribusi nyata. Metrik hanya dicantumkan jika tersedia.</p></div>
          <label className="checkbox-field"><input type="checkbox" checked={Boolean(form.unggulan)} onChange={e => setForm({ ...form, unggulan: e.target.checked ? 1 : 0 })} />Tampilkan sebagai proyek pilihan</label>

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
          <p>Apakah Anda yakin ingin menghapus karya proyek berikut?</p>
          <div className="delete-target-card">
            <strong>{deleteConfirm.title}</strong>
          </div>
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

export default Karya;
