
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { githubApi } from '../services/githubApi';
import { Content, Branch } from '../types';
import { ArrowLeft, GitBranch, ChevronDown, Check, Search, Filter, ArrowUpDown, FileImage, FileCode, FileText, Settings, Clock } from 'lucide-react';
import { getFileIcon } from '../utils/fileIcons';
import { formatFileSize, formatRelativeTime } from '../utils/formatters';
import FileViewer from './FileViewer';
import { useSettings } from '../contexts/SettingsContext';
import CustomLoader from './common/CustomLoader';

interface FileExplorerProps {
  owner: string;
  name: string;
  path: string;
  branch: string;
  branches: Branch[];
}

type SortOption = 'name-asc' | 'name-desc' | 'size-asc' | 'size-desc' | 'date-asc' | 'date-desc';
type FilterType = 'all' | 'code' | 'image' | 'config' | 'document';

const FileExplorer: React.FC<FileExplorerProps> = ({ owner, name, path, branch, branches }) => {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<Content | null>(null);
  
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  
  const [branchSearchTerm, setBranchSearchTerm] = useState('');
  const [fileSearchTerm, setFileSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [filterType, setFilterType] = useState<FilterType>('all');
  
  const [folderSizes, setFolderSizes] = useState<Record<string, number>>({});
  const [fileDates, setFileDates] = useState<Record<string, string>>({});
  
  const branchDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target as Node)) setIsBranchDropdownOpen(false);
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) setIsSortDropdownOpen(false);
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) setIsFilterDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setFileSearchTerm('');
    setFileDates({});
    
    githubApi.getContents(owner, name, path, branch)
      .then(response => {
        if (!Array.isArray(response.data)) {
          navigate(`/repo/${owner}/${name}/blob/${branch}/${path}`, { replace: true });
          return;
        }
        setContents(response.data);
      })
      .catch(err => {
        setError('Could not fetch file contents.');
      })
      .finally(() => setLoading(false));
  }, [owner, name, path, branch, navigate]);

  useEffect(() => {
    if (contents.length === 0) return;
    let isMounted = true;
    const fetchDates = async () => {
      const itemsToFetch = contents.slice(0, 50); 
      const promises = itemsToFetch.map(async (item) => {
        try {
           await new Promise(resolve => setTimeout(resolve, Math.random() * 500));
           const res = await githubApi.getLastCommitForPath(owner, name, item.path, branch);
           if (res.data && res.data[0] && isMounted) {
               setFileDates(prev => ({ ...prev, [item.path]: res.data[0].commit.author.date }));
           }
        } catch {}
      });
      await Promise.allSettled(promises);
    };
    fetchDates();
    return () => { isMounted = false; };
  }, [contents, owner, name, branch]);

  useEffect(() => {
    setFolderSizes({});
    const calculateSizes = async () => {
      try {
        const { data } = await githubApi.getTree(owner, name, branch, true);
        const sizes: Record<string, number> = {};
        data.tree.forEach((item) => {
          if (item.type === 'blob' && item.size) {
            const parts = item.path.split('/');
            let currentPath = '';
            for (let i = 0; i < parts.length - 1; i++) {
              currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
              sizes[currentPath] = (sizes[currentPath] || 0) + item.size;
            }
          }
        });
        setFolderSizes(sizes);
      } catch {}
    };
    calculateSizes();
  }, [owner, name, branch]);
  
  const handleBranchSelect = (newBranch: string) => {
    setIsBranchDropdownOpen(false);
    setBranchSearchTerm('');
    if (newBranch !== branch) navigate(`/repo/${owner}/${name}/tree/${newBranch}`);
  };

  const getFileTypeCategory = (fileName: string): FilterType => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp'].includes(ext)) return 'image';
    if (['md', 'txt', 'pdf', 'doc', 'docx'].includes(ext)) return 'document';
    if (['json', 'yaml', 'yml', 'xml', 'config', 'env', 'toml'].includes(ext)) return 'config';
    return 'code';
  };

  const processedContents = useMemo(() => {
    let result = [...contents];
    if (fileSearchTerm) result = result.filter(item => item.name.toLowerCase().includes(fileSearchTerm.toLowerCase()));
    if (filterType !== 'all') {
      result = result.filter(item => {
        if (item.type === 'dir') return true;
        return getFileTypeCategory(item.name) === filterType;
      });
    }
    result.sort((a, b) => {
      if (a.type === 'dir' && b.type !== 'dir') return -1;
      if (a.type !== 'dir' && b.type === 'dir') return 1;
      const getSize = (item: Content) => (item.type === 'dir' ? folderSizes[item.path] || 0 : item.size);
      const getDate = (item: Content) => (fileDates[item.path] ? new Date(fileDates[item.path]).getTime() : 0);
      switch (sortOption) {
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'size-asc': return getSize(a) - getSize(b);
        case 'size-desc': return getSize(b) - getSize(a);
        case 'date-asc': return getDate(a) - getDate(b);
        case 'date-desc': return getDate(b) - getDate(a);
        case 'name-asc': default: return a.name.localeCompare(b.name);
      }
    });
    return result;
  }, [contents, fileSearchTerm, filterType, sortOption, folderSizes, fileDates]);

  const filteredBranches = branches.filter(b => b.name.toLowerCase().includes(branchSearchTerm.toLowerCase()));
  const breadcrumbs = path.split('/').filter(Boolean);

  const handleFileClick = (file: Content) => {
    navigate(`/repo/${owner}/${name}/blob/${branch}/${file.path}`);
    setSelectedFile(file);
  }
  
  const closeFileViewer = () => {
    navigate(`/repo/${owner}/${name}/tree/${branch}/${path}`);
    setSelectedFile(null);
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64"><CustomLoader size={48} /></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="bg-white dark:bg-base-900 border border-base-300 dark:border-base-700 rounded-lg shadow-sm overflow-hidden">
      <div className="p-3 bg-base-50 dark:bg-base-800 rounded-t-lg border-b border-base-200 dark:border-base-700 flex flex-col gap-3">
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
          <div className="relative flex-shrink-0" ref={branchDropdownRef}>
            <button onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-lg hover:bg-base-50 dark:hover:bg-base-700 transition-colors group shadow-sm w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-1.5 truncate">
                <GitBranch size={14} className="text-gray-500 group-hover:text-primary transition-colors" />
                <span className="truncate max-w-[120px] text-gray-700 dark:text-base-300">{branch}</span>
              </div>
              <ChevronDown size={12} className="text-gray-400 ml-2" />
            </button>
            
            {isBranchDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 max-h-60 overflow-y-auto bg-white dark:bg-base-900 border border-base-200 dark:border-base-700 rounded-lg shadow-xl z-20 animate-fade-in custom-scrollbar">
                <div className="sticky top-0 p-2 bg-white dark:bg-base-900 border-b border-base-200 dark:border-base-700">
                  <input type="text" value={branchSearchTerm} onChange={(e) => setBranchSearchTerm(e.target.value)} placeholder="Find a branch..." className="w-full px-3 py-1.5 text-xs bg-base-50 dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" autoFocus />
                </div>
                {filteredBranches.map(b => (
                  <button key={b.name} onClick={() => handleBranchSelect(b.name)} className="w-full text-left px-4 py-2 text-xs hover:bg-base-50 dark:hover:bg-base-800 flex items-center justify-between text-gray-700 dark:text-base-300">
                    <span className="truncate">{b.name}</span>
                    {branch === b.name && <Check size={12} className="text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center text-sm overflow-x-auto whitespace-nowrap scrollbar-hide mask-fade-right flex-1">
             <Link to={`/repo/${owner}/${name}/tree/${branch}`} className="font-semibold text-primary hover:underline ml-1">{name}</Link>
             {breadcrumbs.map((part, index) => {
               const routeTo = breadcrumbs.slice(0, index + 1).join('/');
               return (
                 <React.Fragment key={index}>
                   <span className="mx-1 text-gray-400">/</span>
                   <Link to={`/repo/${owner}/${name}/tree/${branch}/${routeTo}`} className={`hover:text-primary hover:underline ${index === breadcrumbs.length - 1 ? 'font-bold text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-base-400'}`}>
                     {part}
                   </Link>
                 </React.Fragment>
               );
             })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full">
           <div className="relative group flex-grow min-w-[200px]">
              <input type="text" value={fileSearchTerm} onChange={(e) => setFileSearchTerm(e.target.value)} placeholder="Go to file..." className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-base-900 border border-base-300 dark:border-base-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400 dark:placeholder-gray-500 text-gray-700 dark:text-base-200" />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
           </div>

           <div className="relative" ref={filterDropdownRef}>
             <button onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors ${filterType !== 'all' ? 'bg-primary/10 border-primary text-primary' : 'bg-white dark:bg-base-800 border-base-300 dark:border-base-700 text-gray-600 dark:text-base-300'}`}>
               <Filter size={14} />
               <span className="hidden sm:inline">{filterType === 'all' ? 'Filter' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}</span>
             </button>
             {isFilterDropdownOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-base-900 border border-base-200 dark:border-base-700 rounded-lg shadow-xl z-20 animate-fade-in p-1">
                  {[{ id: 'all', label: 'All Files', icon: Settings }, { id: 'code', label: 'Code', icon: FileCode }, { id: 'image', label: 'Images', icon: FileImage }, { id: 'document', label: 'Documents', icon: FileText }, { id: 'config', label: 'Config', icon: Settings }].map((item) => (
                    <button key={item.id} onClick={() => { setFilterType(item.id as FilterType); setIsFilterDropdownOpen(false); }} className={`w-full text-left px-2 py-1.5 text-xs rounded-md flex items-center justify-between ${filterType === item.id ? 'bg-primary/10 text-primary' : 'text-gray-700 dark:text-base-300 hover:bg-base-50 dark:hover:bg-base-800'}`}>
                       <div className="flex items-center gap-2"><item.icon size={12} /><span>{item.label}</span></div>
                       {filterType === item.id && <Check size={12} />}
                    </button>
                  ))}
                </div>
             )}
           </div>

           <div className="relative" ref={sortDropdownRef}>
             <button onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-white dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-lg hover:bg-base-50 dark:hover:bg-base-700 transition-colors text-gray-600 dark:text-base-300">
               <ArrowUpDown size={14} />
             </button>
             {isSortDropdownOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-base-900 border border-base-200 dark:border-base-700 rounded-lg shadow-xl z-20 animate-fade-in p-1">
                  {[{ id: 'name-asc', label: 'Name (A-Z)' }, { id: 'name-desc', label: 'Name (Z-A)' }, { id: 'size-asc', label: 'Size (Smallest)' }, { id: 'size-desc', label: 'Size (Largest)' }, { id: 'date-desc', label: 'Date (Newest)' }, { id: 'date-asc', label: 'Date (Oldest)' }].map((item) => (
                    <button key={item.id} onClick={() => { setSortOption(item.id as SortOption); setIsSortDropdownOpen(false); }} className={`w-full text-left px-2 py-1.5 text-xs rounded-md flex items-center justify-between ${sortOption === item.id ? 'bg-primary/10 text-primary' : 'text-gray-700 dark:text-base-300 hover:bg-base-50 dark:hover:bg-base-800'}`}>
                       <span>{item.label}</span>
                       {sortOption === item.id && <Check size={12} />}
                    </button>
                  ))}
                </div>
             )}
           </div>
        </div>
      </div>
      
      {/* Header Row for columns (Visible on desktop) */}
      <div className="hidden sm:flex items-center justify-between px-4 py-2 bg-base-50 dark:bg-base-800/50 border-b border-base-200 dark:border-base-700 text-xs font-semibold text-gray-500 dark:text-gray-400">
         <span className="flex-1">Name</span>
         <div className="flex items-center gap-6 min-w-[200px] justify-end">
            <span className="w-32 text-right">Last Modified</span>
            <span className="w-16 text-right">Size</span>
         </div>
      </div>

      <div className="divide-y divide-base-200 dark:divide-base-800 bg-white dark:bg-base-900">
        {path && (
          <div className="px-4 py-2 hover:bg-base-50 dark:hover:bg-base-800 transition-colors">
            <Link to={`/repo/${owner}/${name}/tree/${branch}/${breadcrumbs.slice(0, -1).join('/')}`} className="flex items-center text-primary text-sm font-medium">
              <span className="mr-2">..</span>
              <span className="text-xs text-gray-500">Go back</span>
            </Link>
          </div>
        )}
        
        {processedContents.length > 0 ? (
          processedContents.map((item) => (
            <div 
                key={item.path} 
                className="group flex items-center justify-between px-4 py-2.5 hover:bg-base-50 dark:hover:bg-base-800 transition-colors cursor-pointer" 
                onClick={() => item.type === 'dir' ? navigate(`/repo/${owner}/${name}/tree/${branch}/${item.path}`) : handleFileClick(item)}
            >
              <div className="flex items-center min-w-0 flex-1 mr-4">
                <div className="mr-3 flex-shrink-0">{getFileIcon(item.name, item.type)}</div>
                <span className="text-sm text-gray-700 dark:text-gray-200 truncate group-hover:text-primary transition-colors font-medium">{item.name}</span>
              </div>
              
              <div className="flex items-center gap-6 flex-shrink-0 min-w-[200px] justify-end">
                 {/* Timestamp Column */}
                 <div className="text-xs text-gray-400 dark:text-gray-500 w-32 text-right">
                     {fileDates[item.path] ? (
                         <span className="truncate block" title={new Date(fileDates[item.path]).toLocaleString()}>
                             {formatRelativeTime(fileDates[item.path])}
                         </span>
                     ) : (
                         <span className="opacity-0 group-hover:opacity-50 transition-opacity flex items-center justify-end">
                            <Clock size={10} className="mr-1" /> ...
                         </span>
                     )}
                 </div>

                 {/* File Size Column */}
                 <div className="text-xs text-gray-500 dark:text-gray-400 font-mono w-16 text-right">
                    {item.type === 'dir' ? (folderSizes[item.path] ? formatFileSize(folderSizes[item.path]) : '-') : formatFileSize(item.size)}
                 </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-base-400 text-sm">
            {fileSearchTerm || filterType !== 'all' ? 'No matching files found.' : 'No files found.'}
          </div>
        )}
      </div>

      {selectedFile && <FileViewer owner={owner} repoName={name} file={selectedFile} branch={branch} onClose={closeFileViewer} />}
    </div>
  );
};

export default FileExplorer;
