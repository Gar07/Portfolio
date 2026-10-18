// frontend/src/components/Alert.jsx
import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Alert = ({ alert, setAlert }) => {
  useEffect(() => {
    if (alert?.show) {
      const timer = setTimeout(() => {
        setAlert({ show: false, type: "", message: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert, setAlert]);

  if (!alert || !alert.show) return null;

  const isSuccess = alert.type === 'success';
  const isError = alert.type === 'error';

  return (
    <div className={`alert ${alert.type || 'info'}`} role="alert">
      <div className="alert-icon-wrapper">
        {isSuccess && <CheckCircle2 size={20} className="alert-icon" />}
        {isError && <AlertCircle size={20} className="alert-icon" />}
        {!isSuccess && !isError && <Info size={20} className="alert-icon" />}
      </div>
      <div className="alert-content">
        <div className="alert-title">
          {alert.type ? alert.type.toUpperCase() : 'NOTIFIKASI'}
        </div>
        <div className="alert-message">{alert.message}</div>
      </div>
      <button
        type="button"
        className="alert-close-btn"
        onClick={() => setAlert({ show: false, type: "", message: "" })}
        aria-label="Tutup notifikasi"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Alert;
