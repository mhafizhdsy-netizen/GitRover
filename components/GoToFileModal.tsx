import React, { useState, useEffect, useRef, useCallback } from 'react';
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

const ITEM_HEIGHT = 44; // Corresponds to py-2.5 (10px * 2) + line height, rounded
const VISIBLE_ITEMS = 12;

const GoToFileModal: React.FC<GoToFileModalProps> = ({ owner, name, branch, show, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<TreeItem[]>([]);
  const [fullTree, setFullTree] = useState<TreeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Virtualization state
  const [scrollTop, setScrollTop] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
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
            setResults(filesOnly);
          })
          .catch(err => console.error("Failed to fetch repo tree", err))
          .finally(() => setLoading(false));
      }
    } else {
      setSearchTerm('');
      setSelectedIndex(0);
      setScrollTop(0);
    }
  }, [show, owner, name, branch, fullTree.length]);

  useEffect(() => {
    if (searchTerm === '') {
      setResults(fullTree);
      setSelectedIndex(0);
      return;
    }
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
    setResults(filtered);
    setSelectedIndex(0);
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [searchTerm, fullTree]);
  
  const handleItemClick = (path: string) => {
    navigate(`/repo/${owner}/${name}/blob/${branch}/${path}`);
    onClose();
  };

  const handleNavigation = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
            handleItemClick(results[selectedIndex].path);
        }
    } else if (e.key === 'Escape') {
        onClose();
    }
  }, [results, selectedIndex, owner, name, branch, navigate, onClose]);

  useEffect(() => {
    if (show) {
        window.addEventListener('keydown', handleNavigation);
    }
    return () => window.removeEventListener('keydown', handleNavigation);
  }, [show, handleNavigation]);

  useEffect(() => {
    if (!listRef.current) return;
    const itemTop = selectedIndex * ITEM_HEIGHT;
    const itemBottom = itemTop + ITEM_HEIGHT;
    const viewTop = listRef.current.scrollTop;
    const viewBottom = viewTop + listRef.current.clientHeight;

    if (itemTop < viewTop) {
        listRef.current.scrollTop = itemTop;
    } else if (itemBottom > viewBottom) {
        listRef.current.scrollTop = itemBottom - listRef.current.clientHeight;
    }
  }, [selectedIndex]);


  // --- Virtualization Logic ---
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };
  
  const startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
  const endIndex = Math.min(startIndex + VISIBLE_ITEMS + 5, results.length);
  const visibleItems = results.slice(startIndex, endIndex);

  const portalRoot = document.getElementById('portal-root');
  if (!portalRoot || !show) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-base-900 shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-fade-in rounded-xl" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-base-200 dark:border-base-800 flex items-center gap-3 flex-shrink-0">
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

        <div className="flex-1 min-h-0 overflow-y-auto max-h-[60vh] relative" onScroll={handleScroll} ref={listRef}>
            {loading ? (
                <div className="flex items-center justify-center p-16 space-x-3 text-gray-500">
                    <Loader2 size={20} className="animate-spin" />
                    <span>Loading file tree...</span>
                </div>
            ) : results.length > 0 ? (
                <div style={{ height: `${results.length * ITEM_HEIGHT}px` }} className="relative w-full">
                    {visibleItems.map((item, i) => {
                        const index = startIndex + i;
                        return (
                            <div
                                key={item.path}
                                onClick={() => handleItemClick(item.path)}
                                style={{
                                    transform: `translateY(${index * ITEM_HEIGHT}px)`,
                                    height: `${ITEM_HEIGHT}px`,
                                }}
                                className={`absolute top-0 left-0 w-full px-4 flex items-center gap-3 border-l-2 cursor-pointer ${
                                    selectedIndex === index
                                    ? 'bg-primary/10 border-primary' 
                                    : 'border-transparent hover:bg-primary/5 dark:hover:bg-primary/10'
                                }`}
                            >
                                <div className="flex-shrink-0">{getFileIcon(item.path, 'file')}</div>
                                <span className="text-sm text-gray-700 dark:text-gray-200 truncate">{item.path}</span>
                            </div>
                        );
                    })}
                </div>
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