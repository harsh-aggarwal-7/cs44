import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

const toastConfig = {
  success: {
    icon: CheckCircle,
    bg: 'bg-emerald-50 dark:bg-emerald-950/80',
    border: 'border-emerald-200 dark:border-emerald-800',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    textColor: 'text-emerald-800 dark:text-emerald-200',
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-50 dark:bg-red-950/80',
    border: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-500 dark:text-red-400',
    textColor: 'text-red-800 dark:text-red-200',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50 dark:bg-blue-950/80',
    border: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-500 dark:text-blue-400',
    textColor: 'text-blue-800 dark:text-blue-200',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50 dark:bg-amber-950/80',
    border: 'border-amber-200 dark:border-amber-800',
    iconColor: 'text-amber-500 dark:text-amber-400',
    textColor: 'text-amber-800 dark:text-amber-200',
  },
};

const toastVariants = {
  initial: {
    opacity: 0,
    x: 80,
    y: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    x: 80,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

function ToastItem({ id, message, type, onClose }) {
  const config = toastConfig[type] || toastConfig.info;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`
        flex items-start gap-3 w-80 p-4
        ${config.bg} ${config.border}
        border backdrop-blur-xl rounded-xl
        shadow-lg shadow-black/5 dark:shadow-black/20
      `}
    >
      <Icon size={20} className={`${config.iconColor} flex-shrink-0 mt-0.5`} />
      <p className={`text-sm font-medium flex-1 ${config.textColor}`}>{message}</p>
      <button
        onClick={() => onClose(id)}
        className={`${config.textColor} opacity-60 hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5`}
        aria-label="Dismiss toast"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'info') => {
      const id = ++counterRef.current;

      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);

      return id;
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <ToastItem
                id={toast.id}
                message={toast.message}
                type={toast.type}
                onClose={removeToast}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastProvider;
export { ToastProvider, useToast };
