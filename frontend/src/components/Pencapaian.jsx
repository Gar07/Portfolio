import { useCallback, useEffect, useState } from 'react';
import { GetPencapaian, AddPencapaian, UpdatePencapaian, DeletePencapaian } from '../api/backendApi';
import Modal from './Modal';
import Button from './Button';
import Alert from './Alert';
import Loading from './Loading';

const empty = { nama: '', penyelenggara: '', jenis: 'Prestasi', tahun: '', periode: '', deskripsi: '', url: '' };

export default function Pencapaian({ token }) {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [alert, setAlert] = useState({ show: false });
  const load = useCallback(async () => {
    try {
      const { data } = await GetPencapaian(token);
      setList(data.pencapaian || []);
    } catch { setAlert({ show: true, type: 'error', message: 'Pencapaian belum dapat dimuat.' }); }
    finally { setLoading(false); }
  }, [token]);
  useEffect(() => { load(); }, [load]);

  const edit = item => {
    setEditing(item?.id || null);
    setForm(item ? { ...empty, ...item, tahun: item.tahun || '' } : empty);
    setOpen(true);
  };
  const save = async e => {
    e.preventDefault(); setBusy(true);
    try {
      const payload = { ...form, tahun: Number(form.tahun), token };
      if (editing) await UpdatePencapaian({ ...payload, id: editing });
      else await AddPencapaian(payload);
      setOpen(false); await load();
      setAlert({ show: true, type: 'success', message: 'Pencapaian disimpan.' });
    } catch (error) { setAlert({ show: true, type: 'error', message: error.response?.data?.message || 'Pencapaian gagal disimpan.' }); }
    finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true);
    try {
      await DeletePencapaian(deleting.id, token);
      setDeleting(null); await load();
      setAlert({ show: true, type: 'success', message: 'Pencapaian dihapus.' });
    } catch { setAlert({ show: true, type: 'error', message: 'Pencapaian gagal dihapus.' }); }
    finally { setBusy(false); }
  };

  return <div className="crud-section">
    <div className="section-header"><div><h3 className="section-title">Pencapaian & kegiatan</h3><p className="section-subtitle">Prestasi, apresiasi, sertifikasi, dan kegiatan yang relevan.</p></div><Button text="Tambah Pencapaian" onClick={() => edit(null)} /></div>
    {loading ? <Loading type="inline" /> : !list.length ? <p className="empty-state">Belum ada pencapaian.</p> : <div className="table-responsive"><table className="custom-table"><thead><tr><th>Nama</th><th>Jenis / periode</th><th>Aksi</th></tr></thead><tbody>{list.map(item => <tr key={item.id}>
      <td><strong>{item.nama}</strong><p className="help-text">{item.penyelenggara}</p></td><td>{item.jenis}<p className="help-text">{item.periode || item.tahun || 'Belum dicantumkan'}</p></td>
      <td><div className="action-buttons"><button className="button secondary" onClick={() => edit(item)}>Edit</button><button className="button button-danger" onClick={() => setDeleting(item)}>Hapus</button></div></td>
    </tr>)}</tbody></table></div>}
    <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Edit Pencapaian' : 'Tambah Pencapaian'} isLoading={busy}>
      <form onSubmit={save}>
        <div className="form-group"><label htmlFor="achievement-name">Nama pencapaian / kegiatan</label><input id="achievement-name" required maxLength={255} value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} /></div>
        <div className="form-group"><label htmlFor="achievement-organizer">Penyelenggara / penerbit</label><input id="achievement-organizer" required maxLength={255} value={form.penyelenggara} onChange={e => setForm({ ...form, penyelenggara: e.target.value })} /></div>
        <div className="form-row"><div className="form-group"><label htmlFor="achievement-type">Jenis</label><select id="achievement-type" value={form.jenis} onChange={e => setForm({ ...form, jenis: e.target.value })}>{['Prestasi','Sertifikasi','Kegiatan'].map(type => <option key={type}>{type}</option>)}</select></div>
          <div className="form-group"><label htmlFor="achievement-year">Tahun</label><input id="achievement-year" type="number" min="1950" max="2099" value={form.tahun} onChange={e => setForm({ ...form, tahun: e.target.value })} /></div></div>
        <div className="form-group"><label htmlFor="achievement-period">Periode / tanggal</label><input id="achievement-period" maxLength={80} value={form.periode} onChange={e => setForm({ ...form, periode: e.target.value })} placeholder="Agustus 2026" /></div>
        <div className="form-group"><label htmlFor="achievement-description">Kontribusi / keterangan</label><textarea id="achievement-description" rows={4} maxLength={3000} value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} /></div>
        <div className="form-group"><label htmlFor="achievement-url">URL bukti / kredensial (opsional)</label><input id="achievement-url" type="url" maxLength={1000} value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} /><p className="help-text">Kosongkan jika belum tersedia. Cantumkan hanya bukti yang boleh diakses publik.</p></div>
        <div className="form-actions"><Button text="Batal" primary={false} type="button" onClick={() => setOpen(false)} /><Button text="Simpan Pencapaian" type="submit" disabled={busy} /></div>
      </form>
    </Modal>
    <Modal isOpen={Boolean(deleting)} onClose={() => setDeleting(null)} title="Hapus Pencapaian" isLoading={busy}><p>Hapus {deleting?.nama}? Data ini akan dihapus permanen.</p><div className="form-actions"><Button text="Batal" primary={false} onClick={() => setDeleting(null)} /><button className="button button-danger" onClick={remove} disabled={busy}>Ya, hapus</button></div></Modal>
    <Alert alert={alert} setAlert={setAlert} />
  </div>;
}
