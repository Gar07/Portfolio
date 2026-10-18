// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Biodata from "../components/Biodata";
import Pendidikan from "../components/Pendidikan";
import Pengalaman from "../components/Pengalaman";
import Keahlian from "../components/Keahlian";
import Kontak from "../components/Kontak";
import Karya from "../components/Karya";
import Pencapaian from "../components/Pencapaian";
import Loading from "../components/Loading";
import {
  User, GraduationCap, Briefcase, Code2, Share2, FolderGit2,
  ExternalLink, Sun, Moon, LogOut, ShieldCheck, LayoutDashboard, Award
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { token, user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Tab aktif saat ini (default: 'biodata')
  const [activeTab, setActiveTab] = useState("biodata");

  useEffect(() => {
    document.title = "Admin · Portofolio";
  }, []);

  // Proteksi Rute: Jika tidak memiliki token, langsung lempar ke halaman login
  if (loading) return <Loading title="Memeriksa sesi…" />;
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const tabs = [
    { id: "biodata", label: "Biodata", icon: <User size={16} /> },
    { id: "pendidikan", label: "Pendidikan", icon: <GraduationCap size={16} /> },
    { id: "pengalaman", label: "Pengalaman", icon: <Briefcase size={16} /> },
    { id: "keahlian", label: "Keahlian", icon: <Code2 size={16} /> },
    { id: "karya", label: "Karya", icon: <FolderGit2 size={16} /> },
    { id: "pencapaian", label: "Pencapaian", icon: <Award size={16} /> },
    { id: "kontak", label: "Kontak", icon: <Share2 size={16} /> },
  ];

  const handleLogout = async () => {
    if (await logout()) navigate("/login");
  };

  return (
    <div className="dashboard-layout">
      {/* Top Navbar */}
      <header className="dashboard-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <div className="brand-logo-icon">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className="nav-title">Admin portofolio</h1>
              <div className="nav-user-badge">
                <ShieldCheck size={13} />
                <span>Masuk sebagai: <strong>{user?.nama_lengkap || user?.username || "Gar2007"}</strong></span>
              </div>
            </div>
          </div>

          <div className="nav-actions">
            <Link to="/" target="_blank" rel="noreferrer" className="button secondary">
              Lihat portofolio <ExternalLink size={15} />
            </Link>

            <button
              type="button"
              className="button button-icon-only theme-btn"
              onClick={toggleTheme}
              title={theme === "light" ? "Ganti ke Mode Gelap" : "Ganti ke Mode Terang"}
              aria-label={theme === "light" ? "Aktifkan mode gelap" : "Aktifkan mode terang"}
            >
              {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
            </button>

            <button
              type="button"
              className="button btn-logout"
              onClick={handleLogout}
              title="Keluar dari akun"
            >
              <LogOut size={15} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="dashboard-main container">
        {/* Tab Navigation Pill Bar */}
        <div className="tab-navigation-wrapper">
          <select className="mobile-section-select" aria-label="Bagian portofolio" value={activeTab} onChange={e => setActiveTab(e.target.value)}>
            {tabs.map(tab => <option key={tab.id} value={tab.id}>{tab.label}</option>)}
          </select>
          <nav className="tab-pills" aria-label="Bagian portofolio">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  aria-pressed={isActive}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-pill-btn ${isActive ? "active" : ""}`}
                >
                  <span className="tab-pill-icon">{tab.icon}</span>
                  <span className="tab-pill-label">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content Card Panel */}
        <div className="dashboard-panel-card">
          {activeTab === "biodata" && <Biodata token={token} />}
          {activeTab === "pendidikan" && <Pendidikan token={token} />}
          {activeTab === "pengalaman" && <Pengalaman token={token} />}
          {activeTab === "keahlian" && <Keahlian token={token} />}
          {activeTab === "karya" && <Karya token={token} />}
          {activeTab === "pencapaian" && <Pencapaian token={token} />}
          {activeTab === "kontak" && <Kontak token={token} />}
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>Portofolio pribadi · Panel pengelola</p>
      </footer>
    </div>
  );
};

export default Dashboard;
