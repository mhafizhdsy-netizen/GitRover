import React, { useState, useEffect } from 'react';
import { githubApi } from '../services/githubApi';
import { CompareResult, Release } from '../types';
import { Loader2, X, GitCommit, ArrowRight, FilePlus, FileMinus, FileEdit, AlertTriangle, FileDiff, ChevronDown } from 'lucide-react';
import { formatRelativeTime } from '../utils/formatters';

interface CompareModalProps {
  owner: string;
  repo: string;
  base: string;
  head: string;
  releases: Release[];
  onClose: () => void;
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        Comparing Changes
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                        {/* Base Selector */}
                        <div className="relative">
                            <select 
                                value={baseVersion}
                                onChange={(e) => setBaseVersion(e.target.value)}
                                className="appearance-none bg-white dark:bg-base-800 border border-base-300 dark:border-base-700 text-gray-700 dark:text-gray-200 text-xs font-mono py-1.5 pl-3 pr-8 rounded-md focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                            >
                                {releases.map(r => (
                                    <option key={r.tag_name} value={r.tag_name}>{r.tag_name}</option>
                                ))}
                            </select>
                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>

                        <span className="text-gray-400"><ArrowRight size={14} /></span>

                        {/* Head Selector */}
                        <div className="relative">
                            <select 
                                value={headVersion}
                                onChange={(e) => setHeadVersion(e.target.value)}
                                className="appearance-none bg-white dark:bg-base-800 border border-base-300 dark:border-base-700 text-gray-700 dark:text-gray-200 text-xs font-mono py-1.5 pl-3 pr-8 rounded-md focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                            >
                                {releases.map(r => (
                                    <option key={r.tag_name} value={r.tag_name}>{r.tag_name}</option>
                                ))}
                            </select>
                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-base-200 dark:hover:bg-base-800 text-gray-500 self-start md:self-center">
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