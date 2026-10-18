// frontend/src/pages/Logout.jsx
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      if (await logout()) navigate("/login");
    };
    handleLogout();
  }, [logout, navigate]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <Loading type="fixed" title="Mengeluarkan sesi Anda..." />
    </div>
  );
};

export default Logout;
