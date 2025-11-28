
import React, { useState, useEffect, useRef } from 'react';
import { githubApi } from '../services/githubApi';
import { CompareResult, Release } from '../types';
import { Loader2, X, GitCommit, ArrowRight, FilePlus, FileMinus, FileEdit, AlertTriangle, FileDiff, ChevronDown, Check, Calendar, User, ArrowUpRight, Hash } from 'lucide-react';
import { formatRelativeTime } from '../utils/formatters';

interface CompareModalProps {
  owner: string;
  repo: string;
  base: string;
  head: string;
  releases: Release[];
  onClose: () => void;
}

// --- Sub-Component: Release Selector (Ultra Compact) ---
const ReleaseSelector: React.FC<{
    label: string;
    value: string;
    options: Release[];
    onChange: (val: string) => void;
    color?: 'blue' | 'purple';
}> = ({ label, value, options, onChange, color = 'blue' }) => {
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

    const activeBorderClass = color === 'blue' ? 'focus:border-blue-500' : 'focus:border-purple-500';
    const activeRingClass = color === 'blue' ? 'focus:ring-blue-500/20' : 'focus:ring-purple-500/20';

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-0.5 uppercase tracking-wider ml-0.5">
                {label}
            </label>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between bg-white dark:bg-base-900 border border-base-200 dark:border-base-700 rounded-md px-2 py-1 text-xs font-medium transition-all duration-200 hover:border-gray-400 dark:hover:border-base-500 focus:outline-none focus:ring-1 ${activeRingClass} ${activeBorderClass} shadow-sm h-7`}
            >
                <span className="truncate font-bold text-gray-900 dark:text-gray-100">{value}</span>
                <ChevronDown size={12} className={`text-gray-400 transition-transform duration-300 flex-shrink-0 ml-1 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-full min-w-[120px] max-h-40 overflow-y-auto bg-white dark:bg-base-900 border border-base-200 dark:border-base-700 rounded-md shadow-xl z-50 animate-fade-in custom-scrollbar">
                    {options.map((release) => (
                        <button
                            key={release.tag_name}
                            onClick={() => {
                                onChange(release.tag_name);
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center px-2 py-1.5 hover:bg-base-50 dark:hover:bg-base-800 transition-colors text-left border-b border-base-50 dark:border-base-800/50 last:border-0 group gap-2"
                        >
                             <div className={`w-1.5 h-1.5 rounded-full border flex-shrink-0 ${value === release.tag_name ? `bg-${color === 'blue' ? 'blue' : 'purple'}-500 border-transparent` : 'border-gray-300 dark:border-gray-600'}`} />
                            <span className={`text-xs truncate ${value === release.tag_name ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-base-400'}`}>
                                {release.tag_name}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Sub-Component: Diff Stat Bar ---
const DiffStatBar: React.FC<{ additions: number; deletions: number }> = ({ additions, deletions }) => {
    const total = additions + deletions;
    if (total === 0) return null;
    
    // Calculate percentages, ensuring at least a sliver shows if > 0
    const addPct = Math.max(additions > 0 ? 5 : 0, (additions / total) * 100);
    const delPct = Math.max(deletions > 0 ? 5 : 0, (deletions / total) * 100);
    
    // Normalize if they exceed 100 due to min-width
    const normTotal = addPct + delPct;
    const finalAdd = (addPct / normTotal) * 100;
    const finalDel = (delPct / normTotal) * 100;

    return (
        <div className="flex items-center gap-2 w-24 sm:w-32">
            <div className="h-1.5 flex-1 flex rounded-full overflow-hidden bg-base-200 dark:bg-base-800">
                <div style={{ width: `${finalAdd}%` }} className="bg-green-500 h-full" />
                <div style={{ width: `${finalDel}%` }} className="bg-red-500 h-full" />
            </div>
        </div>
    );
}

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
        case 'added': return <FilePlus size={16} className="text-green-600 dark:text-green-400" />;
        case 'removed': return <FileMinus size={16} className="text-red-500 dark:text-red-400" />;
        case 'modified': return <FileEdit size={16} className="text-amber-500 dark:text-amber-400" />;
        case 'renamed': return <ArrowRight size={16} className="text-purple-500 dark:text-purple-400" />;
        default: return <FileDiff size={16} className="text-blue-500 dark:text-blue-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
      const styles = {
          added: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
          removed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
          modified: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
          renamed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
          default: 'bg-gray-100 text-gray-700 dark:bg-base-800 dark:text-gray-300'
      };
      const style = styles[status as keyof typeof styles] || styles.default;
      
      return (
          <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${style}`}>
              {status}
          </span>
      )
  }

  return (
    <div className="fixed inset-0 bg-base-950/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white dark:bg-base-950 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90dvh] flex flex-col overflow-hidden border border-base-200 dark:border-base-800" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- Header Section --- */}
        <header className="flex-shrink-0 bg-base-50 dark:bg-base-900 p-4 border-b border-base-200 dark:border-base-800">
            <div className="flex items-center justify-between mb-4">
                 <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ArrowUpRight className="text-primary" size={18} />
                        Release Comparison
                    </h2>
                 </div>
                 <button onClick={onClose} className="p-1.5 rounded-full bg-white dark:bg-base-800 border border-base-200 dark:border-base-700 hover:bg-base-100 dark:hover:bg-base-700 text-gray-500 transition-colors shadow-sm">
                    <X size={16} />
                </button>
            </div>

            {/* Selector Controls */}
            <div className="flex flex-row items-end gap-2">
                <div className="flex-1 min-w-0">
                    <ReleaseSelector 
                        label="Base" 
                        value={baseVersion} 
                        options={releases} 
                        onChange={setBaseVersion}
                        color="blue"
                    />
                </div>

                <div className="flex items-center justify-center pb-1.5 px-1 text-gray-400">
                     <ArrowRight size={16} />
                </div>

                <div className="flex-1 min-w-0">
                    <ReleaseSelector 
                        label="Head" 
                        value={headVersion} 
                        options={releases} 
                        onChange={setHeadVersion}
                        color="purple"
                    />
                </div>
            </div>
        </header>

        {/* --- Main Content Area --- */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-white dark:bg-base-950 scroll-smooth">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
                    <Loader2 size={32} className="animate-spin text-primary mb-3" />
                    <p className="text-gray-500 text-sm font-medium animate-pulse">Analyzing...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center px-6">
                    <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-3">
                        <AlertTriangle size={24} className="text-red-500" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Comparison Failed</h3>
                    <p className="text-xs text-gray-500 max-w-xs">{error}</p>
                    <button 
                        onClick={() => { setBaseVersion(initialBase); setHeadVersion(initialHead); }}
                        className="mt-4 px-3 py-1.5 bg-base-100 dark:bg-base-800 rounded-lg text-xs font-medium hover:bg-base-200 dark:hover:bg-base-700 transition-colors"
                    >
                        Reset to default
                    </button>
                </div>
            ) : data ? (
                <div className="p-4">
                    
                    {/* Stats Dashboard */}
                    <div className="grid grid-cols-4 gap-2 mb-6">
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-2 rounded-lg border border-blue-100 dark:border-blue-900/30 text-center">
                            <div className="text-lg font-extrabold text-blue-600 dark:text-blue-400 leading-none">{data.total_commits}</div>
                            <div className="text-[9px] font-bold text-blue-400/80 dark:text-blue-500/80 uppercase tracking-wider mt-1">Commits</div>
                        </div>
                        <div className="bg-purple-50/50 dark:bg-purple-900/10 p-2 rounded-lg border border-purple-100 dark:border-purple-900/30 text-center">
                            <div className="text-lg font-extrabold text-purple-600 dark:text-purple-400 leading-none">{data.files.length}</div>
                            <div className="text-[9px] font-bold text-purple-400/80 dark:text-purple-500/80 uppercase tracking-wider mt-1">Files</div>
                        </div>
                        <div className="bg-green-50/50 dark:bg-green-900/10 p-2 rounded-lg border border-green-100 dark:border-green-900/30 text-center">
                            <div className="text-lg font-extrabold text-green-600 dark:text-green-400 leading-none">
                                +{data.files.reduce((acc, f) => acc + f.additions, 0)}
                            </div>
                            <div className="text-[9px] font-bold text-green-500/80 uppercase tracking-wider mt-1">Add</div>
                        </div>
                        <div className="bg-red-50/50 dark:bg-red-900/10 p-2 rounded-lg border border-red-100 dark:border-red-900/30 text-center">
                            <div className="text-lg font-extrabold text-red-600 dark:text-red-400 leading-none">
                                -{data.files.reduce((acc, f) => acc + f.deletions, 0)}
                            </div>
                            <div className="text-[9px] font-bold text-red-500/80 uppercase tracking-wider mt-1">Del</div>
                        </div>
                    </div>

                    {/* Segmented Control Tabs */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-base-100 dark:bg-base-900 p-0.5 rounded-lg inline-flex shadow-inner border border-base-200 dark:border-base-800 w-full md:w-auto">
                            <button 
                                onClick={() => setActiveTab('commits')}
                                className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${activeTab === 'commits' ? 'bg-white dark:bg-base-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                <GitCommit size={12} />
                                Commits
                            </button>
                            <button 
                                onClick={() => setActiveTab('files')}
                                className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${activeTab === 'files' ? 'bg-white dark:bg-base-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                <FileDiff size={12} />
                                Files
                            </button>
                        </div>
                    </div>

                    {/* Content List */}
                    <div className="bg-white dark:bg-base-900 rounded-xl border border-base-200 dark:border-base-800 overflow-hidden shadow-sm">
                        {activeTab === 'commits' && (
                            <ul className="divide-y divide-base-100 dark:divide-base-800">
                                {data.commits.map((commit) => (
                                    <li key={commit.sha} className="group hover:bg-base-50 dark:hover:bg-base-800/50 transition-colors p-3">
                                        <div className="flex items-start gap-3">
                                            {/* Avatar Timeline Effect */}
                                            <div className="relative pt-0.5">
                                                <div className="w-6 h-6 rounded-full border border-base-200 dark:border-base-700 overflow-hidden">
                                                    {commit.author?.avatar_url ? (
                                                        <img src={commit.author.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-base-100 dark:bg-base-800 flex items-center justify-center">
                                                            <User size={12} className="text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-0.5 line-clamp-1 group-hover:text-primary transition-colors">
                                                            {commit.commit.message.split('\n')[0]}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                                            <span className="font-medium">{commit.commit.author.name}</span>
                                                            <span className="w-0.5 h-0.5 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar size={8} />
                                                                {formatRelativeTime(commit.commit.author.date)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <a 
                                                        href={commit.html_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="font-mono text-[9px] bg-base-100 dark:bg-base-800 border border-base-200 dark:border-base-700 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded hover:border-primary hover:text-primary transition-colors flex items-center gap-1"
                                                    >
                                                        <Hash size={8} />
                                                        {commit.sha.substring(0, 7)}
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                                {data.commits.length === 0 && (
                                    <li className="p-8 text-center">
                                        <div className="inline-flex p-3 rounded-full bg-base-50 dark:bg-base-800 text-gray-400 mb-2">
                                            <Check size={20} />
                                        </div>
                                        <p className="text-gray-500 text-xs font-medium">No commits found between these versions.</p>
                                    </li>
                                )}
                            </ul>
                        )}

                        {activeTab === 'files' && (
                            <ul className="divide-y divide-base-100 dark:divide-base-800">
                                {data.files.map((file) => (
                                    <li key={file.filename} className="p-3 hover:bg-base-50 dark:hover:bg-base-800/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            {/* Icon Status */}
                                            <div className="flex-shrink-0" title={file.status}>
                                                {getFileIcon(file.status)}
                                            </div>

                                            {/* File Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <p className="text-xs font-mono font-medium text-gray-800 dark:text-gray-200 truncate" title={file.filename}>
                                                        {file.filename}
                                                    </p>
                                                    {getStatusBadge(file.status)}
                                                </div>
                                                
                                                {/* Mobile Diff Stats */}
                                                <div className="sm:hidden text-[10px] text-gray-500 font-mono">
                                                    <span className="text-green-600 mr-2">+{file.additions}</span>
                                                    <span className="text-red-600">-{file.deletions}</span>
                                                </div>
                                            </div>

                                            {/* Visual Diff Bar (Desktop) */}
                                            <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                                                <DiffStatBar additions={file.additions} deletions={file.deletions} />
                                                <div className="text-[10px] font-mono text-gray-500 w-16 text-right">
                                                    <span className="text-green-600">+{file.additions}</span>
                                                    <span className="mx-1">/</span>
                                                    <span className="text-red-600">-{file.deletions}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                                {data.files.length === 0 && (
                                    <li className="p-8 text-center">
                                        <div className="inline-flex p-3 rounded-full bg-base-50 dark:bg-base-800 text-gray-400 mb-2">
                                            <Check size={20} />
                                        </div>
                                        <p className="text-gray-500 text-xs font-medium">No files changed.</p>
                                    </li>
                                )}
                            </ul>
                        )}
                    </div>
                </div>
            ) : null}
        </div>
      </div>
    </div>
  );
};

export default CompareModal;
