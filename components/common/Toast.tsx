import React from 'react';
import { useToast, ToastItem } from '../../contexts/ToastContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast: React.FC<{ toast: ToastItem }> = ({ toast }) => {
  const { removeToast } = useToast();

  const isError = toast.type === 'error';

  const icon = isError
    ? <AlertCircle size={22} className="text-red-500" />
    : (toast.type === 'success'
      ? <CheckCircle2 size={22} className="text-primary" />
      : <Info size={22} className="text-primary" />
    );

  const themeClasses = isError
    ? 'border-red-500/30 dark:border-red-500/20 bg-red-50/80 dark:bg-red-900/20'
    : 'border-primary/30 dark:border-primary/20 bg-primary/5 dark:bg-primary/10';
    
  const progressColorStyle = isError
    ? { color: '#ef4444' } // red-500
    : { color: 'rgb(var(--color-primary))' };


  return (
    <div className={`
      relative w-full max-w-sm overflow-hidden
      rounded-xl border shadow-xl backdrop-blur-lg
      ${themeClasses}
      animate-fade-in transform transition-all duration-300 hover:scale-[1.02]
      group
    `}>
      <div className="flex items-start p-4">
        <div className="flex-shrink-0 mr-3 mt-0.5">
          {icon}
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

      <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 w-full animate-shimmer" style={progressColorStyle}></div>
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