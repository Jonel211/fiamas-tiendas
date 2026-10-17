import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'info', title, description, duration = 3500 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      setToasts((prev) => [...prev, { id, type, title, description }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const toast = useMemo(
    () => ({
      success: (title, description, duration) =>
        addToast({ type: 'success', title, description, duration }),
      error: (title, description, duration) =>
        addToast({ type: 'error', title, description, duration }),
      info: (title, description, duration) =>
        addToast({ type: 'info', title, description, duration }),
      warning: (title, description, duration) =>
        addToast({ type: 'warning', title, description, duration }),
      dismiss: removeToast,
    }),
    [addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Contenedor flotante de mensajes minimalistas (Toasts) */}
      <div
        aria-live="polite"
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((item) => (
          <ToastItem key={item.id} toast={item} onClose={() => removeToast(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Componente individual de Toast minimalista
const ToastItem = ({ toast, onClose }) => {
  const configs = {
    success: {
      icon: CheckCircle2,
      accentBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      iconColor: 'text-emerald-500 dark:text-emerald-400',
      borderColor: 'border-emerald-200 dark:border-emerald-800/60',
      badgeBorder: 'border-emerald-200/60 dark:border-emerald-700/50',
    },
    error: {
      icon: AlertCircle,
      accentBg: 'bg-rose-50 dark:bg-rose-950/40',
      iconColor: 'text-rose-500 dark:text-rose-400',
      borderColor: 'border-rose-200 dark:border-rose-800/60',
      badgeBorder: 'border-rose-200/60 dark:border-rose-700/50',
    },
    info: {
      icon: Info,
      accentBg: 'bg-teal-50 dark:bg-teal-950/40',
      iconColor: 'text-teal-600 dark:text-teal-400',
      borderColor: 'border-teal-200 dark:border-teal-800/60',
      badgeBorder: 'border-teal-200/60 dark:border-teal-700/50',
    },
    warning: {
      icon: AlertTriangle,
      accentBg: 'bg-amber-50 dark:bg-amber-950/40',
      iconColor: 'text-amber-500 dark:text-amber-400',
      borderColor: 'border-amber-200 dark:border-amber-800/60',
      badgeBorder: 'border-amber-200/60 dark:border-amber-700/50',
    },
  };

  const current = configs[toast.type] || configs.info;
  const Icon = current.icon;

  return (
    <div
      role="alert"
      className={`pointer-events-auto w-full flex items-start gap-3 p-3.5 rounded-xl bg-white/95 dark:bg-[#1A1F2E]/95 backdrop-blur-md border ${current.borderColor} shadow-lg shadow-black/5 dark:shadow-black/25 animate-toast-in transition-all`}
    >
      <div
        className={`w-8 h-8 rounded-lg ${current.accentBg} ${current.iconColor} border ${current.badgeBorder} flex items-center justify-center flex-shrink-0 mt-0.5`}
      >
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0 pr-1">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
          {toast.title}
        </h4>
        {toast.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            {toast.description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar notificación"
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 transition-colors -mr-1 -mt-1"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser usado dentro de un ToastProvider');
  }
  return context;
};

export default ToastContext;
