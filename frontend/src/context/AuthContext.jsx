import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { LogoutApi, VerifyLoginApi } from '../api/backendApi';

const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const login = useCallback((csrf, data) => { setToken(csrf); setUser(data); }, []);
  const clear = useCallback(() => { setToken(null); setUser(null); }, []);
  useEffect(() => {
    let active = true;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    const expire = () => clear();
    window.addEventListener('portfolio:session-expired', expire);
    VerifyLoginApi().then(({ data }) => { if (active) login(data.token, data.user); })
      .catch(() => { if (active) clear(); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; window.removeEventListener('portfolio:session-expired', expire); };
  }, [clear, login]);
  const logout = useCallback(async () => {
    try { if (token) await LogoutApi(token); }
    catch (error) {
      if (error.response?.status !== 401) {
        window.alert('Belum berhasil keluar. Periksa koneksi dan coba lagi.');
        return false;
      }
    }
    clear();
    return true;
  }, [token, clear]);
  return <AuthContext.Provider value={{ token, user, setUser, loading, login, logout }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
