import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import Loading from './Loading';

export default function Modal({ children, isOpen, onClose, title, subtitle = null, isLoading = false, loadingTitle = 'Memproses…', maxWidth = '560px' }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    if (!isOpen) return;
    const dialog = ref.current;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = overflow; };
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <dialog ref={ref} className="modal-backdrop" style={{ maxWidth }} aria-labelledby={titleId}
      onCancel={e => { e.preventDefault(); if (!isLoading) onClose(); }}
      onClick={e => { if (e.target === e.currentTarget && !isLoading) onClose(); }}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><div><h3 id={titleId}>{title}</h3>{subtitle && <p className="modal-subtitle">{subtitle}</p>}</div><button className="modal-close" type="button" onClick={onClose} disabled={isLoading} aria-label="Tutup dialog"><X size={20} /></button></div>
        <div className="modal-body" inert={isLoading || undefined}>{children}</div>
        {isLoading && <div className="modal-loading-overlay"><Loading type="modal" title={loadingTitle} /></div>}
      </div>
    </dialog>
  );
}
