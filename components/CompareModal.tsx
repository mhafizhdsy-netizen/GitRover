
import React, { useState, useEffect, useRef } from 'react';
import { githubApi } from '../services/githubApi';
import { CompareResult, Release } from '../types';
import { Loader2, X, GitCommit, ArrowRight, FilePlus, FileMinus, FileEdit, AlertTriangle, FileDiff, ChevronDown, Check } from 'lucide-react';
import { formatRelativeTime } from '../utils/formatters';

interface CompareModalProps {
  owner: string;
  repo: string;
  base: string;
  head: string;
  releases: Release[];
  onClose: () => void;
}

// Custom Radio-style Dropdown Selector
const ReleaseSelector: React.FC<{
    label: string;
    value: string;
    options: Release[];
    onChange: (val: string) => void;
}> = ({ label, value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full md:w-auto min-w-[200px]" ref={dropdownRef}>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 ml-1 uppercase tracking-wide">
                {label}
            </label>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-white dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
                <span className="truncate">{value}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-full md:w-64 max-h-64 overflow-y-auto bg-white dark:bg-base-900 border border-base-200 dark:border-base-700 rounded-lg shadow-xl z-30 animate-fade-in custom-scrollbar">
                    <div className="sticky top-0 bg-base-50 dark:bg-base-950 p-2 border-b border-base-200 dark:border-base-800 text-xs font-semibold text-gray-500">
                        Select Release
                    </div>
                    {options.map((release) => (
                        <button
                            key={release.tag_name}
                            onClick={() => {
                                onChange(release.tag_name);
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center px-4 py-3 hover:bg-base-50 dark:hover:bg-base-800 transition-colors text-left"
                        >
                            <div className={`flex items-center justify-center w-4 h-4 rounded-full border mr-3 flex-shrink-0
                                ${value === release.tag_name 
                                    ? 'border-primary bg-primary' 
                                    : 'border-gray-300 dark:border-gray-600'}`
                            }>
                                {value === release.tag_name && (
                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={`text-sm font-medium truncate ${value === release.tag_name ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                    {release.tag_name}
                                </div>
                                <div className="text-xs text-gray-400 truncate">
                                    {formatRelativeTime(release.published_at)}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const CompareModal: React.FC<CompareModalProps> = ({ owner, repo, base: initialBase, head: initialHead, releases, onClose }) => {
  const [data, setData] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'commits' | 'files'>('commits');

  // Comparison State
  const [baseVersion, setBaseVersion] = useState(initialBase);
  const [headVersion, setHeadVersion] = useState(initialHead);

  useEffect(() => {
    setLoading(true);
    setError(null);
    githubApi.compareCommits(owner, repo, baseVersion, headVersion)
      .then(res => setData(res.data))
      .catch(err => {
        console.error(err);
        setError(err.message || 'Failed to compare releases');
      })
      .finally(() => setLoading(false));
  }, [owner, repo, baseVersion, headVersion]);

  const getFileIcon = (status: string) => {
    switch(status) {
        case 'added': return <FilePlus size={16} className="text-green-500" />;
        case 'removed': return <FileMinus size={16} className="text-red-500" />;
        case 'modified': return <FileEdit size={16} className="text-blue-500" />;
        case 'renamed': return <ArrowRight size={16} className="text-purple-500" />;
        default: return <FileDiff size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white dark:bg-base-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex-shrink-0 border-b border-base-200 dark:border-base-800 p-5 bg-base-50 dark:bg-base-950">
            <div className="flex flex-col md:flex-row items-start md:items-start justify-between gap-6">
                <div className="w-full">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        Comparing Changes
                    </h2>
                    
                    {/* Responsive Selectors */}
                    <div className="flex flex-col md:flex-row items-center gap-3 w-full">
                        {/* Base Selector */}
                        <ReleaseSelector 
                            label="Base (Older)" 
                            value={baseVersion} 
                            options={releases} 
                            onChange={setBaseVersion} 
                        />

                        {/* Direction Arrow */}
                        <div className="flex items-center justify-center p-2 mt-4 md:mt-5 text-gray-400">
                             <ArrowRight size={20} className="rotate-90 md:rotate-0" />
                        </div>

                        {/* Head Selector */}
                        <ReleaseSelector 
                            label="Head (Newer)" 
                            value={headVersion} 
                            options={releases} 
                            onChange={setHeadVersion} 
                        />
                    </div>
                </div>
                
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-base-200 dark:hover:bg-base-800 text-gray-500 transition-colors">
                    <X size={20} />
                </button>
            </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-white dark:bg-base-900">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                    <Loader2 size={32} className="animate-spin text-primary mb-4" />
                    <p className="text-gray-500">Analyzing diffs...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center h-64 text-red-500 px-6 text-center">
                    <AlertTriangle size={32} className="mb-4" />
                    <p>{error}</p>
                    <p className="text-sm text-gray-400 mt-2">Try selecting different versions.</p>
                </div>
            ) : data ? (
                <>
                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-base-50 dark:bg-base-950/30 border-b border-base-200 dark:border-base-800">
                         <div className="text-center">
                             <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.total_commits}</div>
                             <div className="text-xs text-gray-500 uppercase tracking-wide">Commits</div>
                         </div>
                         <div className="text-center">
                             <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.files.length}</div>
                             <div className="text-xs text-gray-500 uppercase tracking-wide">Files Changed</div>
                         </div>
                         <div className="text-center">
                             <div className="text-2xl font-bold text-green-500">+{data.files.reduce((acc, f) => acc + f.additions, 0)}</div>
                             <div className="text-xs text-gray-500 uppercase tracking-wide">Additions</div>
                         </div>
                         <div className="text-center">
                             <div className="text-2xl font-bold text-red-500">-{data.files.reduce((acc, f) => acc + f.deletions, 0)}</div>
                             <div className="text-xs text-gray-500 uppercase tracking-wide">Deletions</div>
                         </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-base-200 dark:border-base-800 sticky top-0 bg-white dark:bg-base-900 z-10">
                        <button 
                            onClick={() => setActiveTab('commits')}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'commits' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                        >
                            Commits
                        </button>
                        <button 
                             onClick={() => setActiveTab('files')}
                             className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'files' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                        >
                            Files Changed
                        </button>
                    </div>

                    {/* Lists */}
                    <div className="p-0">
                        {activeTab === 'commits' && (
                            <ul className="divide-y divide-base-100 dark:divide-base-800">
                                {data.commits.map((commit) => (
                                    <li key={commit.sha} className="p-4 hover:bg-base-50 dark:hover:bg-base-950 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 flex-shrink-0">
                                                <GitCommit size={16} className="text-gray-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{commit.commit.message.split('\n')[0]}</p>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                    <img src={commit.author?.avatar_url || ''} className="w-4 h-4 rounded-full bg-gray-200" alt="" />
                                                    <span className="font-semibold">{commit.commit.author.name}</span>
                                                    <span>committed {formatRelativeTime(commit.commit.author.date)}</span>
                                                </div>
                                            </div>
                                            <a href={commit.html_url} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-primary hover:underline bg-primary/10 px-2 py-1 rounded hidden sm:inline-block">
                                                {commit.sha.substring(0, 7)}
                                            </a>
                                        </div>
                                    </li>
                                ))}
                                {data.commits.length === 0 && <li className="p-8 text-center text-gray-500">No commits found between these versions.</li>}
                            </ul>
                        )}

                        {activeTab === 'files' && (
                            <ul className="divide-y divide-base-100 dark:divide-base-800">
                                {data.files.map((file) => (
                                    <li key={file.filename} className="p-3 hover:bg-base-50 dark:hover:bg-base-950 transition-colors text-sm">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span title={file.status}>{getFileIcon(file.status)}</span>
                                                <span className="font-mono text-gray-700 dark:text-gray-300 truncate" title={file.filename}>{file.filename}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-medium flex-shrink-0">
                                                <span className="text-green-600">+{file.additions}</span>
                                                <span className="text-red-600">-{file.deletions}</span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                                {data.files.length === 0 && <li className="p-8 text-center text-gray-500">No files changed.</li>}
                            </ul>
                        )}
                    </div>
                </>
            ) : null}
        </div>
      </div>
    </div>
  );
};

export default CompareModal;
