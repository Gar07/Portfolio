// frontend/src/components/Keahlian.jsx
import { useState, useEffect, useCallback } from 'react';
import { GetKeahlian, AddKeahlian, UpdateKeahlian, DeleteKeahlian, delay } from '../api/backendApi';
import Modal from './Modal';
import Button from './Button';
import Alert from './Alert';
import Loading from './Loading';
import { SKILL_LEVELS, SKILL_CATEGORIES, getSkillLevel } from '../utils/skillLevels';
import {
  Code2, Plus, Edit2, Trash2, Search, Zap, CheckCircle2
} from 'lucide-react';

const Keahlian = ({ token }) => {
  const [list, setList] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({
    nama_keahlian: '',
    level: '', kategori: 'Bahasa pemrograman'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, title: '' });

  const fetchData = useCallback(async () => {
    if (!token) return;
    setIsLoadingData(true);
    try {
      const [res] = await Promise.all([GetKeahlian(token), delay(200)]);
      if (res.data.status === 'success') {
        setList(res.data.keahlian || []);
      }
    } catch (err) {
      console.error(err);
      setAlert({ show: true, message: 'Gagal mengambil data keahlian', type: 'error' });
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
    setForm({ nama_keahlian: '', level: '', kategori: 'Bahasa pemrograman' });
    setIsOpen(true);
  };

  const handleOpenEdit = (item) => {
    setIsEdit(true);
    setCurrentId(item.id);
    setForm({ nama_keahlian: item.nama_keahlian, level: getSkillLevel(item.level).value || item.level || '', kategori: item.kategori || 'Lainnya' });
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...form, token };
      if (isEdit) {
        payload.id = currentId;
        await UpdateKeahlian(payload);
        setAlert({ show: true, message: 'Keahlian berhasil diperbarui!', type: 'success' });
      } else {
        await AddKeahlian(payload);
        setAlert({ show: true, message: 'Keahlian berhasil disimpan!', type: 'success' });
      }
      setIsOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setAlert({ show: true, message: err.response?.data?.message || 'Gagal menyimpan keahlian', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (item) => {
    setDeleteConfirm({
      isOpen: true,
      id: item.id,
      title: `${item.nama_keahlian} (${item.level})`
    });
  };

  const executeDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await DeleteKeahlian(deleteConfirm.id, token);
      setAlert({ show: true, message: 'Keahlian berhasil dihapus!', type: 'success' });
      setDeleteConfirm({ isOpen: false, id: null, title: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      setAlert({ show: true, message: 'Gagal menghapus keahlian', type: 'error' });
    }
  };

  const filteredList = list.filter((item) =>
    item.nama_keahlian?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.level?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="crud-section">
      <div className="section-header">
        <div>
          <h3 className="section-title"><Code2 className="inline-icon" size={20} /> Keahlian & Teknologi</h3>
          <p className="section-subtitle">Daftar skill teknis, bahasa pemrograman, dan framework</p>
        </div>
        <Button
          primary={true}
          text="Tambah Keahlian"
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
            placeholder="Cari keahlian atau level kemahiran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="badge-count">
          Total: <strong>{list.length}</strong> Keahlian
        </div>
      </div>

      {isLoadingData ? (
        <Loading type="inline" title="Memuat daftar keahlian..." />
      ) : filteredList.length === 0 ? (
        <div className="empty-state">
          <Code2 size={48} className="empty-icon" />
          <h4>Belum Ada Data Keahlian</h4>
          <p>{searchQuery ? 'Tidak ada keahlian yang cocok.' : 'Tambahkan keahlian utama Anda untuk memamerkan keunggulan teknis.'}</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>No</th>
                <th>Nama Keahlian / Teknologi</th>
                <th>Tingkat Kemahiran (Level)</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item, index) => (
                <tr key={item.id}>
                  <td className="text-center font-mono">{index + 1}</td>
                  <td>
                    <div className="table-item-primary">
                      <Zap size={16} className="table-item-icon" />
                      <strong>{item.nama_keahlian}</strong>
                    </div>
                    <p className="help-text">{item.kategori || 'Lainnya'}</p>
                  </td>
                  <td>
                    <span className="badge-level">
                      <CheckCircle2 size={13} /> {item.level || 'Belum dinilai'}
                    </span>
                    <p className="help-text skill-level-description">{getSkillLevel(item.level).description}</p>
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
        title={isEdit ? 'Edit Keahlian' : 'Tambah Keahlian Baru'}
        subtitle="Tentukan nama skill teknis dan tingkat kemahirannya"
        isLoading={isSubmitting}
        loadingTitle="Menyimpan keahlian..."
      >
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="keahlian-field-1"><Code2 size={14} /> Nama Keahlian / Framework *</label>
            <input id="keahlian-field-1"
              type="text"
              required
              value={form.nama_keahlian}
              onChange={(e) => setForm({ ...form, nama_keahlian: e.target.value })}
              placeholder="cth. React 19 / PHP Native / Tailwind CSS"
            />
          </div>

          <div className="form-group">
            <label htmlFor="keahlian-field-2"><Zap size={14} /> Tingkat Kemahiran (Level)</label>
            <select id="keahlian-field-2"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="custom-select"
              aria-describedby="skill-level-help"
            >
              <option value="">Belum dinilai</option>
              {form.level && !getSkillLevel(form.level).value && <option value={form.level}>{form.level}</option>}
              {SKILL_LEVELS.map(level => <option key={level.value} value={level.value}>{level.value} ({level.label})</option>)}
            </select>
            <p id="skill-level-help" className="help-text">{getSkillLevel(form.level).description} Pilih berdasarkan kemampuan saat ini; level akan terlihat di halaman publik.</p>
          </div>
          <div className="form-group"><label htmlFor="skill-category">Kategori</label><select id="skill-category" value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })}>
            {!SKILL_CATEGORIES.includes(form.kategori) && <option>{form.kategori}</option>}
            {SKILL_CATEGORIES.map(category => <option key={category}>{category}</option>)}
          </select></div>

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
          <p>Apakah Anda yakin ingin menghapus keahlian berikut?</p>
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

export default Keahlian;
