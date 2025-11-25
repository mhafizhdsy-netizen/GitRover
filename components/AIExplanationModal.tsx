
import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { aiService } from '../services/aiService';
import MarkdownRenderer from './MarkdownRenderer';

interface AIExplanationModalProps {
  codeSnippet: string;
  onClose: () => void;
}

const AIExplanationModal: React.FC<AIExplanationModalProps> = ({ codeSnippet, onClose }) => {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getExplanation = async () => {
        try {
            const result = await aiService.explainCode(codeSnippet);
            setExplanation(result);
        } catch (err: any) {
            setError(err.message || 'Failed to get explanation.');
        } finally {
            setLoading(false);
        }
    };
    getExplanation();
  }, [codeSnippet]);

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-base-900 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-5 border-b border-base-200 dark:border-base-800 flex-shrink-0">
          <h2 className="text-lg font-bold flex items-center text-gray-900 dark:text-white">
            <Sparkles size={18} className="mr-2 text-secondary" />
            AI Code Explanation
          </h2>
          <button onClick={onClose} className="p-2 -m-2 rounded-full hover:bg-base-100 dark:hover:bg-base-800 transition text-gray-500 dark:text-gray-400">
            <X size={20} />
          </button>
        </header>
        
        <div className="p-6 overflow-y-auto">
          {/* Selected Code Section - Constrained Height & Wrapping */}
          <div className="bg-base-100 dark:bg-base-800 p-4 rounded-lg border border-base-200 dark:border-base-700">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-500 dark:text-base-400">Selected Code Context</h3>
            <div className="max-h-32 overflow-y-auto custom-scrollbar">
                <pre className="text-xs bg-transparent p-0 whitespace-pre-wrap break-words font-mono text-gray-700 dark:text-gray-300">
                    <code>{codeSnippet}</code>
                </pre>
            </div>
          </div>

          <div className="border-t border-base-200 dark:border-base-800 my-6"></div>
          
          <div>
            {loading && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 size={32} className="animate-spin text-primary mb-3" />
                <p className="text-sm text-gray-500 dark:text-base-400">Analyzing code with Gemini AI...</p>
              </div>
            )}
            
            {error && (
              <div className="flex items-start text-red-500 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                <AlertTriangle size={20} className="mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            {explanation && (
                <div className="animate-fade-in">
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-gray-500 dark:text-base-400">Explanation</h3>
                    <MarkdownRenderer content={explanation} />
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIExplanationModal;
