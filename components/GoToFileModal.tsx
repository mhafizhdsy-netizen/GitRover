import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { githubApi } from '../services/githubApi';
import { Search, Loader2, CornerDownLeft } from 'lucide-react';
import { getFileIcon } from '../utils/fileIcons';

interface GoToFileModalProps {
  owner: string;
  name: string;
  branch: string;
  show: boolean;
  onClose: () => void;
}

interface TreeItem {
  path: string;
  type: 'blob' | 'tree';
}

const GoToFileModal: React.FC<GoToFileModalProps> = ({ owner, name, branch, show, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<TreeItem[]>([]);
  const [fullTree, setFullTree] = useState<TreeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (show) {
      inputRef.current?.focus();
      if (fullTree.length === 0) {
        setLoading(true);
        githubApi.getTree(owner, name, branch, true)
          .then(res => {
            const filesOnly = res.data.tree
              .filter(item => item.type === 'blob' && item.path)
              .map(item => ({ path: item.path!, type: 'blob' as const }));
            setFullTree(filesOnly);
            setResults(filesOnly.slice(0, 100)); // Show initial results
          })
          .catch(err => console.error("Failed to fetch repo tree", err))
          .finally(() => setLoading(false));
      }
    } else {
      // Reset on close
      setSearchTerm('');
      setSelectedIndex(0);
    }
  }, [show, owner, name, branch, fullTree.length]);

  useEffect(() => {
    if (searchTerm === '') {
      setResults(fullTree.slice(0, 100));
      setSelectedIndex(0);
      return;
    }

    // A simple fuzzy search logic
    const searchChars = searchTerm.toLowerCase().split('');
    const filtered = fullTree.filter(item => {
      let currentIndex = -1;
      return searchChars.every(char => {
        const foundIndex = item.path.toLowerCase().indexOf(char, currentIndex + 1);
        if (foundIndex > -1) {
          currentIndex = foundIndex;
          return true;
        }
        return false;
      });
    });

    setResults(filtered.slice(0, 100));
    setSelectedIndex(0);
  }, [searchTerm, fullTree]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!show) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (results[selectedIndex]) {
                navigate(`/repo/${owner}/${name}/blob/${branch}/${results[selectedIndex].path}`);
                onClose();
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };
    // The modal handles its own keyboard events when shown
    if (show) {
        window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, results, selectedIndex, owner, name, branch, navigate, onClose]);

  useEffect(() => {
    listRef.current?.children[selectedIndex]?.scrollIntoView({
        block: 'nearest',
    });
  }, [selectedIndex]);

  if (!show) return null;

  const portalRoot = document.getElementById('portal-root');
  if (!portalRoot) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-start pt-[15vh]" onClick={onClose}>
      <div 
        className="bg-white dark:bg-base-900 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-fade-in" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-base-200 dark:border-base-800 flex items-center gap-3">
            <Search size={18} className="text-gray-400" />
            <input 
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Go to file..."
                className="w-full bg-transparent focus:outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400"
            />
        </div>

        <div className="max-h-[50vh] overflow-y-auto">
            {loading ? (
                <div className="flex items-center justify-center p-16 space-x-3 text-gray-500">
                    <Loader2 size={20} className="animate-spin" />
                    <span>Loading file tree...</span>
                </div>
            ) : results.length > 0 ? (
                <ul ref={listRef}>
                    {results.map((item, index) => (
                        <li 
                            key={item.path}
                            className={`px-4 py-2.5 flex items-center gap-3 border-l-2 ${
                                selectedIndex === index 
                                ? 'bg-primary/10 border-primary' 
                                : 'border-transparent'
                            }`}
                        >
                            <div className="flex-shrink-0">{getFileIcon(item.path, 'file')}</div>
                            <span className="text-sm text-gray-700 dark:text-gray-200 truncate">{item.path}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="p-8 text-center text-gray-500 text-sm">No files found.</p>
            )}
        </div>

        <footer className="p-2 bg-base-50 dark:bg-base-950/50 border-t border-base-200 dark:border-base-800 text-xs text-gray-500 flex items-center justify-end gap-4">
            <span><strong className="px-1.5 py-0.5 rounded bg-base-200 dark:bg-base-800">↑</strong><strong className="px-1.5 py-0.5 rounded bg-base-200 dark:bg-base-800">↓</strong> to navigate</span>
            <span><strong className="px-1.5 py-0.5 rounded bg-base-200 dark:bg-base-800 flex-shrink-0 inline-flex items-center"><CornerDownLeft size={10} className="mr-0.5" /> Enter</strong> to select</span>
            <span><strong className="px-1.5 py-0.5 rounded bg-base-200 dark:bg-base-800">esc</strong> to close</span>
        </footer>
      </div>
    </div>,
    portalRoot
  );
};

export default GoToFileModal;