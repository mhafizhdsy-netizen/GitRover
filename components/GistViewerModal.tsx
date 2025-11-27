
import React, { useState, useEffect } from 'react';
import { Gist, GistFile } from '../types';
import { githubApi } from '../services/githubApi';
import { X, FileCode, Loader2, ExternalLink, Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { formatFileSize } from '../utils/formatters';
import { getLanguageFromFilename } from '../utils/languageUtils';

interface GistViewerModalProps {
  gistId: string;
  onClose: () => void;
}

const GistViewerModal: React.FC<GistViewerModalProps> = ({ gistId, onClose }) => {
  const [gist, setGist] = useState<Gist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  
  const { activeSyntaxTheme } = useSettings();
  const { addToast } = useToast();

  useEffect(() => {
    setLoading(true);
    githubApi.getGist(gistId)
      .then(response => {
        setGist(response.data);
      })
      .catch(err => {
        console.error("Failed to fetch gist", err);
        setError("Failed to load gist details.");
      })
      .finally(() => setLoading(false));
  }, [gistId]);

  const handleCopy = (filename: string, content: string) => {
    if (!content) return;
    navigator.clipboard.writeText(content).then(() => {
        setCopiedFile(filename);
        addToast('Gist content copied to clipboard', 'success');
        setTimeout(() => setCopiedFile(null), 2000);
    }).catch(() => {
        addToast('Failed to copy content', 'error');
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white dark:bg-base-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-5 border-b border-base-200 dark:border-base-800 bg-base-50 dark:bg-base-950 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileCode size={20} className="text-primary" />
                Gist Details
            </h2>
            {gist && <p className="text-xs text-gray-500 mt-1">{gist.description || "No description"}</p>}
          </div>
          <button onClick={onClose} className="p-2 -m-2 rounded-full hover:bg-base-200 dark:hover:bg-base-800 text-gray-500">
            <X size={20} />
          </button>
        </header>
        
        <div className="flex-1 overflow-y-auto p-0 bg-base-100 dark:bg-base-950/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 size={32} className="animate-spin text-primary mb-4" />
                <p className="text-gray-500">Loading gist...</p>
            </div>
          ) : error || !gist ? (
            <div className="flex flex-col items-center justify-center h-64 text-red-500">
                <p>{error || "Gist not found"}</p>
            </div>
          ) : (
            <div className="space-y-6 p-6">
                {Object.values(gist.files).map((file) => {
                    const f = file as GistFile;
                    return (
                        <div key={f.filename} className="bg-white dark:bg-base-900 border border-base-200 dark:border-base-800 rounded-lg overflow-hidden shadow-sm">
                            <div className="flex items-center justify-between px-4 py-2 bg-base-50 dark:bg-base-800 border-b border-base-200 dark:border-base-700">
                                <span className="font-mono text-sm font-semibold text-gray-700 dark:text-gray-200">{f.filename}</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500">{formatFileSize(f.size)}</span>
                                    
                                    <div className="h-4 w-px bg-base-300 dark:bg-base-600 mx-1"></div>

                                    <button 
                                        onClick={() => handleCopy(f.filename, f.content || '')}
                                        className="text-gray-400 hover:text-primary transition-colors p-1 rounded hover:bg-base-200 dark:hover:bg-base-700"
                                        title="Copy content"
                                    >
                                        {copiedFile === f.filename ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                    </button>

                                    <a href={f.raw_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors p-1 rounded hover:bg-base-200 dark:hover:bg-base-700" title="Open Raw">
                                        <ExternalLink size={14} />
                                    </a>
                                </div>
                            </div>
                            <div className="overflow-x-auto text-sm group">
                                <SyntaxHighlighter
                                    language={getLanguageFromFilename(f.filename)}
                                    style={activeSyntaxTheme}
                                    showLineNumbers
                                    wrapLines
                                    lineNumberStyle={{ 
                                        minWidth: '2.5em', 
                                        paddingRight: '1em', 
                                        textAlign: 'right', 
                                        userSelect: 'none', 
                                        opacity: 0.5 
                                    }}
                                    customStyle={{ 
                                        margin: 0, 
                                        padding: '1.5rem', 
                                        background: 'transparent',
                                        fontSize: '14px',
                                        lineHeight: '1.5'
                                    }}
                                    codeTagProps={{ 
                                        style: { 
                                            fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace', 
                                            userSelect: 'text'
                                        } 
                                    }}
                                >
                                    {f.content || ''}
                                </SyntaxHighlighter>
                            </div>
                        </div>
                    );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GistViewerModal;
