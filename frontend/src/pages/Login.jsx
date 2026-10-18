import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LoginApi } from '../api/backendApi';
import Button from '../components/Button';
import Alert from '../components/Alert';

export default function Login() {
  const navigate = useNavigate();
  const { token, user, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState({ show: false });

  useEffect(() => {
    document.title = 'Masuk · Admin portofolio';
    if (token && user) navigate('/dashboard', { replace: true });
  }, [token, user, navigate]);

  const submit = async e => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const { data } = await LoginApi(username.trim(), password);
      if (data.status !== 'success') throw new Error(data.message || 'Username atau password salah.');
      login(data.token, data.user);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setAlert({ show: true, type: 'error', message: error.response?.data?.message || error.message || 'Tidak dapat masuk. Silakan coba kembali.' });
    } finally { setBusy(false); }
  };

  return <div className="login-page-wrapper">
    <header className="login-top-bar"><Link to="/" className="back-link"><ArrowLeft size={17} />Kembali ke portofolio</Link><button className="button button-icon-only" onClick={toggleTheme} aria-label={theme === 'light' ? 'Aktifkan mode gelap' : 'Aktifkan mode terang'}>{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button></header>
    <main className="login-container">
      <div className="login-card-header"><h1>Masuk ke admin.</h1><p>Perbarui profil, proyek, dan cerita di balik portofolio Anda.</p></div>
      <form onSubmit={submit}>
        <div className="form-group"><label htmlFor="username">Username</label><input id="username" name="username" required autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} disabled={busy} /></div>
        <div className="form-group"><label htmlFor="password">Password</label><div className="input-with-action"><input id="password" name="password" required type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} disabled={busy} /><button type="button" className="input-eye-btn" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'} aria-pressed={showPassword}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div>
        <Button type="submit" text={busy ? 'Memverifikasi…' : 'Masuk'} disabled={busy} className="w-full mt-2" />
      </form>
      <p className="login-card-footer">Hanya untuk pengelola portofolio.</p>
    </main><Alert alert={alert} setAlert={setAlert} />
  </div>;
}
