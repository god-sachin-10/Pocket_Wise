import React from 'react';

const Modal = ({ isOpen, onClose, title, children, footer, size = 'default', className = '' }) => {
  if (!isOpen) return null;

  const maxWidths = { sm: 380, default: 480, lg: 600, xl: 720 };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className={`modal ${className}`}
        style={{ maxWidth: maxWidths[size] || 480 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {title && (
          <div className="modal-header">
            <h3 className="modal-title" id="modal-title">{title}</h3>
            <button className="modal-close btn-icon" onClick={onClose} aria-label="Close modal">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, description, confirmLabel = 'Confirm', variant = 'danger', icon = '⚠️' }) => (
  <Modal isOpen={isOpen} onClose={onClose} className="confirm-dialog" size="sm">
    <div style={{ textAlign: 'center' }}>
      <div className="confirm-icon">{icon}</div>
      <h3 className="confirm-title">{title}</h3>
      <p className="confirm-desc" style={{ marginBottom: 24 }}>{description}</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button
          className={`btn ${variant === 'danger' ? 'btn-danger' : variant === 'success' ? 'btn-success' : 'btn-primary'}`}
          onClick={() => { onConfirm(); onClose(); }}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </Modal>
);

export default Modal;
