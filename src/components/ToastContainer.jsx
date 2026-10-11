import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

const icons = {
  success: <CheckCircle size={16} />,
  error: <X size={16} />,
  warning: <AlertTriangle size={16} />,
  info: <Info size={16} />,
};

const ToastContainer = () => {
  const { toasts, removeToast } = useFinance();

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast ${toast.type}`} role="alert">
          <span>{icons[toast.type] || icons.info}</span>
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            style={{ color: 'rgba(255,255,255,0.6)', padding: 2 }}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
