import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

const toastConfig = {
  success: {
    icon: CheckCircle,
    iconColor: 'text-emerald-500',
    barColor: 'bg-emerald-500',
  },
  error: {
    icon: XCircle,
    iconColor: 'text-red-500',
    barColor: 'bg-red-500',
  },
  info: {
    icon: Info,
    iconColor: 'text-indigo-500',
    barColor: 'bg-indigo-500',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    barColor: 'bg-amber-500',
  },
};

const toastVariants = {
  initial: {
    opacity: 0,
    x: 40,
    y: 0,
    scale: 0.96,
  },
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    x: 30,
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: 'easeOut',
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
      className="relative overflow-hidden flex items-start gap-3 w-80 p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 shadow-lg shadow-zinc-200/5 dark:shadow-black/40 backdrop-blur-md"
    >
      {/* Dynamic thin countdown progress line */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 4, ease: 'linear' }}
        className={`absolute bottom-0 left-0 h-[2px] ${config.barColor}`}
      />

      <Icon size={18} className={`${config.iconColor} flex-shrink-0 mt-0.5`} />
      <p className="text-xs font-semibold flex-1 text-zinc-800 dark:text-zinc-200 leading-normal">{message}</p>
      
      <button
        onClick={() => onClose(id)}
        className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 transition-colors flex-shrink-0 mt-0.5 cursor-pointer"
        aria-label="Dismiss toast"
      >
        <X size={14} />
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
