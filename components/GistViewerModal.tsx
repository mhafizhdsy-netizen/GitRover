
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Gist, GistFile } from '../types';
import { githubApi } from '../services/githubApi';
import { X, FileCode, ExternalLink, Copy, Check, Sparkles, Bookmark } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { formatFileSize } from '../utils/formatters';
import { getLanguageFromFilename } from '../utils/languageUtils';
import CustomLoader from './common/CustomLoader';
import AIExplanationModal from './AIExplanationModal';
import { useBookmarks } from '../contexts/BookmarkContext';

interface GistViewerModalProps {
  gistId: string;
  onClose: () => void;
}

const GistViewerModal: React.FC<GistViewerModalProps> = ({ gistId, onClose }) => {
  const [gist, setGist] = useState<Gist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  
  // AI Selection State
  const [selectedText, setSelectedText] = useState('');
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);
  const contentContainerRef = useRef<HTMLDivElement>(null);
  
  const { activeSyntaxTheme } = useSettings();
  const { addToast } = useToast();
  const { isGistBookmarked, addGist, removeGist } = useBookmarks();

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

  const isBookmarked = gist ? isGistBookmarked(gist.id) : false;

  const toggleBookmark = () => {
    if (!gist) return;
    if (isBookmarked) {
        removeGist(gist.id);
    } else {
        addGist(gist);
    }
  };

  // Handle selection logic for AI
  useEffect(() => {
    const handleSelectionChange = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || !contentContainerRef.current?.contains(selection.anchorNode)) {
            setSelectedText('');
            return;
        }

        const text = selection.toString().trim();
        if (text) {
            setSelectedText(text);
        } else {
            setSelectedText('');
        }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

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

  const portalRoot = document.getElementById('portal-root');
  if (!portalRoot) return null;

  return createPortal(
    <>
        <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
        <div 
            className="bg-white dark:bg-base-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative" 
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
            <div className="flex items-center gap-2">
                {gist && (
                    <button
                        onClick={toggleBookmark}
                        className={`p-2 rounded-full transition-colors ${
                            isBookmarked 
                            ? 'text-primary bg-primary/10' 
                            : 'text-gray-400 hover:bg-base-200 dark:hover:bg-base-800 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                        title={isBookmarked ? "Remove from bookmarks" : "Bookmark this gist"}
                    >
                        <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
                    </button>
                )}
                <button onClick={onClose} className="p-2 -m-2 rounded-full hover:bg-base-200 dark:hover:bg-base-800 text-gray-500">
                    <X size={20} />
                </button>
            </div>
            </header>
            
            <div className="flex-1 overflow-y-auto p-0 bg-base-100 dark:bg-base-950/50" ref={contentContainerRef}>
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                    <CustomLoader size={48} text="Loading gist..." />
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
                                <div className="overflow-x-auto text-sm group cursor-text select-text">
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
                                            fontSize: '14px',
                                            lineHeight: '1.5',
                                            cursor: 'text',
                                            userSelect: 'text'
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

            {/* Floating AI Action Dock - Centered at bottom of modal */}
            {selectedText && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setIsExplainModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 ring-2 ring-white/20"
                    >
                        <Sparkles size={16} />
                        Explain Selection
                    </button>
                </div>
            )}
        </div>
        </div>
        {isExplainModalOpen && <AIExplanationModal codeSnippet={selectedText} onClose={() => setIsExplainModalOpen(false)} />}
    </>,
    portalRoot
  );
};

export default GistViewerModal;
