import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { githubApi } from '../services/githubApi';
import { Content, Branch } from '../types';
import { Loader2, ArrowLeft, GitBranch, ChevronDown, Check, Search } from 'lucide-react';
import { getFileIcon } from '../utils/fileIcons';
import { formatFileSize } from '../utils/formatters';
import FileViewer from './FileViewer';
import { useSettings } from '../contexts/SettingsContext';

interface FileExplorerProps {
  owner: string;
  name: string;
  path: string;
  branch: string;
  branches: Branch[];
}

const FileExplorer: React.FC<FileExplorerProps> = ({ owner, name, path, branch, branches }) => {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<Content | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [branchSearchTerm, setBranchSearchTerm] = useState('');
  const [fileSearchTerm, setFileSearchTerm] = useState('');
  const [folderSizes, setFolderSizes] = useState<Record<string, number>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch directory contents
  useEffect(() => {
    setLoading(true);
    setError(null);
    setFileSearchTerm(''); // Reset file search on path change
    githubApi.getContents(owner, name, path, branch)
      .then(response => {
        if (!Array.isArray(response.data)) {
          // This path is a file, navigate to blob view
          navigate(`/repo/${owner}/${name}/blob/${branch}/${path}`, { replace: true });
          return;
        }
        const sortedContents = response.data.sort((a, b) => {
          if (a.type === 'dir' && b.type === 'file') return -1;
          if (a.type === 'file' && b.type === 'dir') return 1;
          return a.name.localeCompare(b.name);
        });
        setContents(sortedContents);
      })
      .catch(err => {
        setError('Could not fetch file contents.');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [owner, name, path, branch, navigate]);

  // Calculate folder sizes
  useEffect(() => {
    // Reset sizes when branch/repo changes
    setFolderSizes({});
    
    const calculateSizes = async () => {
      try {
        // Fetch the full recursive tree for the current branch
        const { data } = await githubApi.getTree(owner, name, branch, true);
        
        const sizes: Record<string, number> = {};
        
        data.tree.forEach((item) => {
          if (item.type === 'blob' && item.size) {
            // item.path is the full path from root, e.g., "src/components/Header.tsx"
            const parts = item.path.split('/');
            
            // Accumulate size for every parent directory in the path
            let currentPath = '';
            for (let i = 0; i < parts.length - 1; i++) {
              currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
              sizes[currentPath] = (sizes[currentPath] || 0) + item.size;
            }
          }
        });
        
        setFolderSizes(sizes);
      } catch (error) {
        // Silently fail if tree fetch fails (e.g. rate limit or too large)
        // We'll just show 'Folder' in that case
        console.error("Failed to calculate folder sizes:", error);
      }
    };

    calculateSizes();
  }, [owner, name, branch]);
  
  const handleBranchSelect = (newBranch: string) => {
    setIsDropdownOpen(false);
    setBranchSearchTerm('');
    if (newBranch !== branch) {
      navigate(`/repo/${owner}/${name}/tree/${newBranch}`);
    }
  };

  const filteredBranches = branches.filter(b => b.name.toLowerCase().includes(branchSearchTerm.toLowerCase()));

  const filteredContents = contents.filter(item =>
    item.name.toLowerCase().includes(fileSearchTerm.toLowerCase())
  );

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
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" size={32} /></div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white dark:bg-base-900 border border-base-300 dark:border-base-700 rounded-lg shadow-sm overflow-hidden">
      <div className="p-3 bg-base-50 dark:bg-base-800 rounded-t-lg border-b border-base-200 dark:border-base-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
          
          {/* Branch Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-lg hover:bg-base-50 dark:hover:bg-base-700 transition-colors group shadow-sm"
              title="Switch branch"
            >
              <GitBranch size={14} className="text-gray-500 group-hover:text-primary transition-colors" />
              <span className="truncate max-w-[90px] text-gray-700 dark:text-base-300">{branch}</span>
              <ChevronDown size={12} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 max-h-60 overflow-y-auto bg-white dark:bg-base-900 border border-base-200 dark:border-base-700 rounded-lg shadow-xl z-20 animate-fade-in custom-scrollbar">
                <div className="sticky top-0 p-2 bg-white dark:bg-base-900 border-b border-base-200 dark:border-base-700">
                  <input
                    type="text"
                    value={branchSearchTerm}
                    onChange={(e) => setBranchSearchTerm(e.target.value)}
                    placeholder="Find a branch..."
                    className="w-full px-3 py-1.5 text-xs bg-base-50 dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-700 dark:text-base-200 placeholder-gray-400"
                    autoFocus
                  />
                </div>
                {filteredBranches.map(b => (
                  <button
                    key={b.name}
                    onClick={() => handleBranchSelect(b.name)}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-base-50 dark:hover:bg-base-800 flex items-center justify-between text-gray-700 dark:text-base-300"
                  >
                    <span className="truncate">{b.name}</span>
                    {branch === b.name && <Check size={12} className="text-primary" />}
                  </button>
                ))}
                {filteredBranches.length === 0 && (
                  <div className="p-4 text-center text-xs text-gray-500">No branches found</div>
                )}
              </div>
            )}
          </div>
          
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm overflow-x-auto whitespace-nowrap scrollbar-hide mask-fade-right">
             <Link to={`/repo/${owner}/${name}/tree/${branch}`} className="font-semibold text-primary hover:underline ml-1">
               {name}
             </Link>
             {breadcrumbs.map((part, index) => {
               const routeTo = breadcrumbs.slice(0, index + 1).join('/');
               return (
                 <React.Fragment key={index}>
                   <span className="mx-1 text-gray-400">/</span>
                   <Link 
                     to={`/repo/${owner}/${name}/tree/${branch}/${routeTo}`}
                     className={`hover:text-primary hover:underline ${index === breadcrumbs.length - 1 ? 'font-bold text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-base-400'}`}
                   >
                     {part}
                   </Link>
                 </React.Fragment>
               );
             })}
          </div>
        </div>

        {/* File Search */}
        <div className="relative group" title="Filter files in current directory">
           <input
             type="text"
             value={fileSearchTerm}
             onChange={(e) => setFileSearchTerm(e.target.value)}
             placeholder="Go to file..."
             className="w-full sm:w-48 sm:focus:w-64 pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-base-900 border border-base-300 dark:border-base-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ease-in-out placeholder-gray-400 dark:placeholder-gray-500 text-gray-700 dark:text-base-200"
           />
           <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
        </div>
      </div>

      {/* File List */}
      <div className="divide-y divide-base-200 dark:divide-base-800 bg-white dark:bg-base-900">
        {path && (
          <div className="px-4 py-2 hover:bg-base-50 dark:hover:bg-base-800 transition-colors">
            <Link to={`/repo/${owner}/${name}/tree/${branch}/${breadcrumbs.slice(0, -1).join('/')}`} className="flex items-center text-primary text-sm font-medium">
              <span className="mr-2">..</span>
              <span className="text-xs text-gray-500">Go back</span>
            </Link>
          </div>
        )}
        
        {filteredContents.length > 0 ? (
          filteredContents.map((item) => (
            <div 
              key={item.path}
              className="group flex items-center justify-between px-4 py-2.5 hover:bg-base-50 dark:hover:bg-base-800 transition-colors cursor-pointer"
              onClick={() => item.type === 'dir' ? navigate(`/repo/${owner}/${name}/tree/${branch}/${item.path}`) : handleFileClick(item)}
            >
              <div className="flex items-center min-w-0 flex-1 mr-4">
                <div className="mr-3 flex-shrink-0">
                  {getFileIcon(item.name, item.type)}
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-200 truncate group-hover:text-primary transition-colors">
                  {item.name}
                </span>
              </div>
              
              <div className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 font-mono">
                {item.type === 'dir' ? (
                   folderSizes[item.path] ? formatFileSize(folderSizes[item.path]) : 'Folder'
                ) : (
                   formatFileSize(item.size)
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-base-400 text-sm">
            No files found.
          </div>
        )}
      </div>

      {/* File Viewer Modal */}
      {selectedFile && (
        <FileViewer 
          owner={owner}
          repoName={name}
          file={selectedFile}
          branch={branch}
          onClose={closeFileViewer}
        />
      )}
    </div>
  );
};

export default FileExplorer;