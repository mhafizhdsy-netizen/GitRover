import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { githubApi } from '../services/githubApi';
import { Search, Loader2, CornerDownLeft, GripHorizontal } from 'lucide-react';
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
const DISMISS_THRESHOLD = 80;

const GoToFileModal: React.FC<GoToFileModalProps> = ({ owner, name, branch, show, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<TreeItem[]>([]);
  const [fullTree, setFullTree] = useState<TreeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Virtualization state
  const [scrollTop, setScrollTop] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
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
      setTouchDelta(0);
      setIsDragging(false);
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

  const handleNavigation = (e: KeyboardEvent) => {
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

  useEffect(() => {
    if (show) {
        window.addEventListener('keydown', handleNavigation);
    }
    return () => window.removeEventListener('keydown', handleNavigation);
  }, [show, results, selectedIndex, owner, name, branch, navigate, onClose]);

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

  // --- Gesture Handlers ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('ul')) return; // Don't drag if starting on the list
    setTouchStart(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const delta = e.touches[0].clientY - touchStart;
    if (delta > 0) { // Only allow dragging down
      setTouchDelta(delta);
    }
  };

  const handleTouchEnd = () => {
    if (touchDelta > DISMISS_THRESHOLD) {
      onClose();
    } else {
      setTouchDelta(0);
    }
    setTouchStart(null);
    setIsDragging(false);
  };

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
    <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-end sm:items-start sm:pt-[15vh] p-0" onClick={onClose}>
      <div 
        ref={modalRef}
        className={`bg-white dark:bg-base-900 shadow-2xl w-full h-full sm:h-auto sm:max-w-2xl flex flex-col overflow-hidden animate-fade-in rounded-none sm:rounded-xl transition-transform duration-200 ease-out ${isDragging ? '!duration-0' : ''}`} 
        style={{ transform: `translateY(${touchDelta}px)` }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="text-center pt-2 pb-1 sm:hidden cursor-grab active:cursor-grabbing">
            <GripHorizontal className="inline-block text-gray-300 dark:text-gray-700" />
        </div>
        <div className="p-3 sm:p-4 border-b border-base-200 dark:border-base-800 flex items-center gap-3 flex-shrink-0">
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

        <div className="flex-1 min-h-0 overflow-y-auto sm:max-h-[50vh] relative" onScroll={handleScroll} ref={listRef}>
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
                                style={{
                                    transform: `translateY(${index * ITEM_HEIGHT}px)`,
                                    height: `${ITEM_HEIGHT}px`,
                                }}
                                className={`absolute top-0 left-0 w-full px-4 flex items-center gap-3 border-l-2 ${
                                    selectedIndex === index
                                    ? 'bg-primary/10 border-primary' 
                                    : 'border-transparent'
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

        <footer className="hidden sm:flex p-2 bg-base-50 dark:bg-base-950/50 border-t border-base-200 dark:border-base-800 text-xs text-gray-500 items-center justify-end gap-4">
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