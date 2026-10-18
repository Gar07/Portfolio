import { safeLink } from '../utils/safeLink';
// frontend/src/components/Kontak.jsx
import { useState, useEffect, useCallback } from 'react';
import { GetKontak, AddKontak, UpdateKontak, DeleteKontak, delay } from '../api/backendApi';
import Modal from './Modal';
import Button from './Button';
import Alert from './Alert';
import Loading from './Loading';
import {
  Share2, Plus, Edit2, Trash2, Search, ExternalLink, Globe,
} from 'lucide-react';
import { getSocialIcon } from './SocialIcons';

const Kontak = ({ token }) => {
  const [list, setList] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({ nama_media: 'LinkedIn', url: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, title: '' });

  const fetchData = useCallback(async () => {
    if (!token) return;
    setIsLoadingData(true);
    try {
      const [res] = await Promise.all([GetKontak(token), delay(200)]);
      if (res.data.status === 'success') {
        setList(res.data.kontak_aktif || []);
      }
    } catch (err) {
      console.error(err);
      setAlert({ show: true, message: 'Gagal mengambil data kontak', type: 'error' });
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
    setForm({ nama_media: 'LinkedIn', url: '' });
    setIsOpen(true);
  };

  const handleOpenEdit = (item) => {
    setIsEdit(true);
    setCurrentId(item.id);
    setForm({ nama_media: item.nama_media || '', url: item.url || '' });
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...form, token };
      if (isEdit) {
        payload.id = currentId;
        await UpdateKontak(payload);
        setAlert({ show: true, message: 'Kontak berhasil diperbarui!', type: 'success' });
      } else {
        await AddKontak(payload);
        setAlert({ show: true, message: 'Kontak berhasil ditambahkan!', type: 'success' });
      }
      setIsOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setAlert({ show: true, message: 'Gagal menyimpan kontak', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (item) => {
    setDeleteConfirm({
      isOpen: true,
      id: item.id,
      title: `${item.nama_media} (${item.url})`
    });
  };

  const executeDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await DeleteKontak(deleteConfirm.id, token);
      setAlert({ show: true, message: 'Kontak berhasil dihapus!', type: 'success' });
      setDeleteConfirm({ isOpen: false, id: null, title: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      setAlert({ show: true, message: 'Gagal menghapus kontak', type: 'error' });
    }
  };

  const getMediaIcon = (mediaName) => {
    return getSocialIcon(mediaName, 16);
  };

  const filteredList = list.filter((item) =>
    item.nama_media?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.url?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="crud-section">
      <div className="section-header">
        <div>
          <h3 className="section-title"><Share2 className="inline-icon" size={20} /> Kontak & Media Sosial Aktif</h3>
          <p className="section-subtitle">Tautan jejaring profesional, email, dan kanal komunikasi Anda</p>
        </div>
        <Button
          primary={true}
          text="Tambah Kontak"
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
            placeholder="Cari kanal media atau tautan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="badge-count">
          Total: <strong>{list.length}</strong> Tautan
        </div>
      </div>

      {isLoadingData ? (
        <Loading type="inline" title="Memuat daftar kontak..." />
      ) : filteredList.length === 0 ? (
        <div className="empty-state">
          <Share2 size={48} className="empty-icon" />
          <h4>Belum Ada Kontak Media Sosial</h4>
          <p>{searchQuery ? 'Tidak ditemukan kontak yang cocok.' : 'Tambahkan saluran komunikasi agar pengunjung dapat menghubungi Anda.'}</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>No</th>
                <th style={{ minWidth: '180px' }}>Platform / Media</th>
                <th>URL / Tautan Lengkap</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item, index) => (
                <tr key={item.id}>
                  <td className="text-center font-mono">{index + 1}</td>
                  <td>
                    <div className="table-item-primary">
                      <span className="media-type-icon">{getMediaIcon(item.nama_media)}</span>
                      <strong>{item.nama_media}</strong>
                    </div>
                  </td>
                  <td>
                    <a
                      href={safeLink(item.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="table-link font-mono text-truncate"
                      style={{ maxWidth: '350px' }}
                    >
                      <span>{item.url}</span>
                      <ExternalLink size={12} />
                    </a>
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
        title={isEdit ? 'Edit Tautan Kontak' : 'Tambah Tautan Kontak Baru'}
        subtitle="Pilih platform dan masukkan alamat URL atau nomor"
        isLoading={isSubmitting}
        loadingTitle="Menyimpan kontak..."
      >
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="kontak-field-1"><Share2 size={14} /> Nama Media / Platform *</label>
            <input id="kontak-field-1"
              type="text"
              required
              value={form.nama_media}
              onChange={(e) => setForm({ ...form, nama_media: e.target.value })}
              placeholder="cth. GitHub, LinkedIn, WhatsApp, Email, Instagram"
            />
          </div>

          <div className="form-group">
            <label htmlFor="kontak-field-2"><Globe size={14} /> URL / Tautan Lengkap *</label>
            <input id="kontak-field-2"
              type="text"
              required
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://linkedin.com/in/... atau mailto:... atau https://wa.me/..."
            />
          </div>

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
          <p>Apakah Anda yakin ingin menghapus kontak berikut?</p>
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

export default Kontak;
