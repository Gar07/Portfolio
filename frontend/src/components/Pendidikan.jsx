// frontend/src/components/Pendidikan.jsx
import { useState, useEffect, useCallback } from 'react';
import { GetPendidikan, AddPendidikan, UpdatePendidikan, DeletePendidikan, delay } from '../api/backendApi';
import Modal from './Modal';
import Button from './Button';
import Alert from './Alert';
import Loading from './Loading';
import { formatPeriod } from '../utils/formatPeriod';
import {
  GraduationCap, Plus, Edit2, Trash2, Search, Calendar, Award, Building2, BookOpen
} from 'lucide-react';

const Pendidikan = ({ token }) => {
  const [list, setList] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({
    nama_institusi: '',
    tingkat: 'S1',
    jurusan: '',
    tahun_mulai: '',
    tahun_selesai: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, title: '' });

  const fetchData = useCallback(async () => {
    if (!token) return;
    setIsLoadingData(true);
    try {
      const [res] = await Promise.all([GetPendidikan(token), delay(200)]);
      if (res.data.status === 'success') {
        setList(res.data.riwayat_pendidikan || []);
      }
    } catch (err) {
      console.error(err);
      setAlert({ show: true, message: 'Gagal mengambil data riwayat pendidikan', type: 'error' });
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
      nama_institusi: '',
      tingkat: 'S1',
      jurusan: '',
      tahun_mulai: '',
      tahun_selesai: ''
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (item) => {
    setIsEdit(true);
    setCurrentId(item.id);
    setForm({
      nama_institusi: item.nama_institusi || '',
      tingkat: item.tingkat || 'S1',
      jurusan: item.jurusan || '',
      tahun_mulai: item.tahun_mulai || '',
      tahun_selesai: item.tahun_selesai || ''
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
        await UpdatePendidikan(payload);
        setAlert({ show: true, message: 'Riwayat pendidikan berhasil diperbarui!', type: 'success' });
      } else {
        await AddPendidikan(payload);
        setAlert({ show: true, message: 'Riwayat pendidikan berhasil ditambahkan!', type: 'success' });
      }
      setIsOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setAlert({ show: true, message: err.response?.data?.message || 'Gagal menyimpan riwayat pendidikan', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (item) => {
    setDeleteConfirm({
      isOpen: true,
      id: item.id,
      title: `${item.tingkat} - ${item.nama_institusi}`
    });
  };

  const executeDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await DeletePendidikan(deleteConfirm.id, token);
      setAlert({ show: true, message: 'Riwayat pendidikan berhasil dihapus!', type: 'success' });
      setDeleteConfirm({ isOpen: false, id: null, title: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      setAlert({ show: true, message: 'Gagal menghapus riwayat pendidikan', type: 'error' });
    }
  };

  const filteredList = list.filter((item) =>
    item.nama_institusi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.jurusan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tingkat?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="crud-section">
      <div className="section-header">
        <div>
          <h3 className="section-title"><GraduationCap className="inline-icon" size={20} /> Riwayat Pendidikan</h3>
          <p className="section-subtitle">Daftar jenjang edukasi formal dan sertifikasi akademis</p>
        </div>
        <Button
          primary={true}
          text="Tambah Pendidikan"
          icon={<Plus size={16} />}
          onClick={handleOpenAdd}
          type="button"
        />
      </div>

      {/* Search and Stats Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Cari institusi, jurusan, atau jenjang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="badge-count">
          Total: <strong>{list.length}</strong> Riwayat
        </div>
      </div>

      {isLoadingData ? (
        <Loading type="inline" title="Memuat riwayat pendidikan..." />
      ) : filteredList.length === 0 ? (
        <div className="empty-state">
          <GraduationCap size={48} className="empty-icon" />
          <h4>Belum Ada Data Pendidikan</h4>
          <p>{searchQuery ? 'Tidak ditemukan data yang sesuai dengan pencarian.' : 'Klik tombol Tambah Pendidikan untuk menambahkan riwayat studi Anda.'}</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>No</th>
                <th>Institusi / Universitas</th>
                <th>Tingkat</th>
                <th>Jurusan</th>
                <th>Tahun</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item, index) => (
                <tr key={item.id}>
                  <td className="text-center font-mono">{index + 1}</td>
                  <td>
                    <div className="table-item-primary">
                      <Building2 size={16} className="table-item-icon" />
                      <span>{item.nama_institusi}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge-level badge-edu">
                      {item.tingkat}
                    </span>
                  </td>
                  <td>
                    <div className="table-item-secondary">
                      <BookOpen size={14} />
                      <span>{item.jurusan}</span>
                    </div>
                  </td>
                  <td>
                    <div className="table-item-year">
                      <Calendar size={14} />
                      <span>{formatPeriod(item.tahun_mulai, item.tahun_selesai)}</span>
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
        title={isEdit ? 'Edit Riwayat Pendidikan' : 'Tambah Riwayat Pendidikan'}
        subtitle="Lengkapi detail institusi dan tahun kelulusan"
        isLoading={isSubmitting}
        loadingTitle="Menyimpan riwayat pendidikan..."
      >
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="pendidikan-field-1"><Building2 size={14} /> Nama Institusi / Kampus / Sekolah *</label>
            <input id="pendidikan-field-1"
              type="text"
              required
              value={form.nama_institusi}
              onChange={(e) => setForm({ ...form, nama_institusi: e.target.value })}
              placeholder="cth. Universitas Indonesia"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pendidikan-field-2"><Award size={14} /> Jenjang Tingkat *</label>
              <select id="pendidikan-field-2"
                value={form.tingkat}
                onChange={(e) => setForm({ ...form, tingkat: e.target.value })}
                className="custom-select"
                required
              >
                <option value="SMA">SMA / SMK / MA</option>
                <option value="D3">Diploma 3 (D3)</option>
                <option value="D4">Diploma 4 (D4)</option>
                <option value="S1">Sarjana (S1)</option>
                <option value="S2">Magister (S2)</option>
                <option value="S3">Doktor (S3)</option>
                <option value="Sertifikasi">Sertifikasi Profesional</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="pendidikan-field-3"><BookOpen size={14} /> Jurusan / Program Studi *</label>
              <input id="pendidikan-field-3"
                type="text"
                required
                value={form.jurusan}
                onChange={(e) => setForm({ ...form, jurusan: e.target.value })}
                placeholder="cth. Teknik Informatika"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pendidikan-field-4"><Calendar size={14} /> Tahun Mulai (opsional)</label>
              <input id="pendidikan-field-4"
                type="number"
                min="1950"
                max="2099"
                placeholder="Belum dicantumkan"
                value={form.tahun_mulai}
                onChange={(e) => setForm({ ...form, tahun_mulai: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="pendidikan-field-5"><Calendar size={14} /> Tahun Selesai (opsional)</label>
              <input id="pendidikan-field-5"
                type="number"
                min="1950"
                max="2099"
                placeholder="Masih berjalan"
                value={form.tahun_selesai}
                onChange={(e) => setForm({ ...form, tahun_selesai: e.target.value })}
              />
            </div>
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
          <p>Apakah Anda yakin ingin menghapus data pendidikan berikut?</p>
          <div className="delete-target-card">
            <strong>{deleteConfirm.title}</strong>
          </div>
          <p className="text-muted-small">Tindakan ini permanen dan tidak dapat dibatalkan.</p>
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

export default Pendidikan;
