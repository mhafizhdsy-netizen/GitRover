import React, { useState, useEffect } from 'react';
import { AlertTriangle, WifiOff, Lock, Search, RefreshCw, Settings, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { parseError } from '../../utils/errorHelpers';
import { useSettings } from '../../contexts/SettingsContext';

interface ErrorDisplayProps {
  error: any;
  onRetry?: () => void;
  fullScreen?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry, fullScreen = false }) => {
  const { openSettingsModal } = useSettings();
  const parsedError = parseError(error);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (parsedError.type === 'auth') {
      openSettingsModal();
    }
  }, [parsedError.type, openSettingsModal]);

  const copyErrorDetails = () => {
    const details = JSON.stringify({
      code: parsedError.code,
      message: parsedError.message,
      original: parsedError.originalError
    }, null, 2);
    navigator.clipboard.writeText(details);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Icon selection based on error type
  const renderIcon = () => {
    switch (parsedError.type) {
      case 'network':
        return <WifiOff size={48} className="text-blue-500" />;
      case 'auth':
        return <Lock size={48} className="text-yellow-500" />;
      case 'not_found':
        return <Search size={48} className="text-purple-500" />;
      default:
        return <AlertTriangle size={48} className="text-red-500" />;
    }
  };

  const containerClass = fullScreen 
    ? "min-h-[60vh] flex flex-col items-center justify-center p-4 text-center"
    : "flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-base-900 rounded-xl border border-base-200 dark:border-base-800 shadow-sm my-4";

  return (
    <div className={containerClass}>
      <div className="mb-6 p-4 bg-base-50 dark:bg-base-950 rounded-full shadow-inner animate-fade-in">
        {renderIcon()}
      </div>

      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {parsedError.title}
      </h2>
      
      <p className="text-gray-600 dark:text-base-300 max-w-md mb-8 text-lg">
        {parsedError.message}
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        {/* Specific Action Buttons */}
        {parsedError.type === 'auth' && (
          <button
            onClick={openSettingsModal}
            className="flex items-center px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold shadow-md transition-all hover:scale-105"
          >
            <Settings size={18} className="mr-2" />
            Open Settings
          </button>
        )}

        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center px-6 py-2.5 bg-white dark:bg-base-800 border border-base-300 dark:border-base-700 hover:bg-base-50 dark:hover:bg-base-700 text-gray-700 dark:text-white rounded-lg font-semibold shadow-sm transition-all"
          >
            <RefreshCw size={18} className="mr-2" />
            Try Again
          </button>
        )}
      </div>

      {/* Technical Details Toggle */}
      <div className="mt-10 w-full max-w-lg">
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center justify-center w-full text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mb-2"
        >
          {showDetails ? <ChevronUp size={14} className="mr-1" /> : <ChevronDown size={14} className="mr-1" />}
          {showDetails ? 'Hide Technical Details' : 'Show Technical Details'}
        </button>
        
        {showDetails && (
          <div className="relative text-left bg-gray-50 dark:bg-black/30 p-4 rounded-lg border border-gray-200 dark:border-gray-800 font-mono text-xs text-gray-600 dark:text-gray-400 overflow-x-auto animate-fade-in">
            <button 
              onClick={copyErrorDetails}
              className="absolute top-2 right-2 p-1.5 rounded bg-white dark:bg-base-800 hover:bg-gray-100 dark:hover:bg-base-700 transition-colors border border-gray-200 dark:border-gray-700"
              title="Copy details"
            >
              {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
            </button>
            <div className="pr-8">
                <p><span className="font-bold">Code:</span> {parsedError.code}</p>
                <p><span className="font-bold">Type:</span> {parsedError.type}</p>
                <p className="mt-2 whitespace-pre-wrap"><span className="font-bold">Raw:</span> {String(parsedError.originalError)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;