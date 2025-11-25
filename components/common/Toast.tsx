
import React from 'react';
import { useToast, ToastItem } from '../../contexts/ToastContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast: React.FC<{ toast: ToastItem }> = ({ toast }) => {
  const { removeToast } = useToast();

  const icons = {
    success: <CheckCircle2 size={22} className="text-green-500" />,
    error: <AlertCircle size={22} className="text-red-500" />,
    info: <Info size={22} className="text-blue-500" />,
  };

  const borderColors = {
    success: 'border-green-500/30 dark:border-green-500/20',
    error: 'border-red-500/30 dark:border-red-500/20',
    info: 'border-blue-500/30 dark:border-blue-500/20',
  };

  const bgGradient = {
    success: 'from-green-50/50 to-white/50 dark:from-green-900/10 dark:to-base-900/80',
    error: 'from-red-50/50 to-white/50 dark:from-red-900/10 dark:to-base-900/80',
    info: 'from-blue-50/50 to-white/50 dark:from-blue-900/10 dark:to-base-900/80',
  };

  return (
    <div className={`
      relative w-full max-w-sm overflow-hidden
      rounded-xl border shadow-xl backdrop-blur-md
      ${borderColors[toast.type]}
      bg-gradient-to-br ${bgGradient[toast.type]}
      animate-fade-in transform transition-all duration-300 hover:scale-[1.02]
      group
    `}>
      <div className="flex items-start p-4">
        <div className="flex-shrink-0 mr-3 mt-0.5">
          {icons[toast.type]}
        </div>
        <div className="flex-1 mr-2">
            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 capitalize">
                {toast.type}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5 leading-tight">
                {toast.message}
            </p>
        </div>
        <button 
          onClick={() => removeToast(toast.id)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
        >
          <X size={16} />
        </button>
      </div>
      
      {/* Simple Progress Bar Animation */}
      <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 w-full animate-shimmer" style={{ color: toast.type === 'success' ? '#22c55e' : toast.type === 'error' ? '#ef4444' : '#3b82f6' }}></div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end space-y-3 pointer-events-none">
      <div className="pointer-events-auto space-y-3">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </div>
    </div>
  );
};
