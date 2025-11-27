
import React, { useState, useEffect, useCallback } from 'react';
import { githubApi } from '../services/githubApi';
import { WorkflowRun } from '../types';
import { Loader2, PlayCircle, CheckCircle2, XCircle, AlertCircle, GitBranch, ServerCrash, Clock, User } from 'lucide-react';
import { formatRelativeTime } from '../utils/formatters';

interface BuildListProps {
  owner: string;
  repo: string;
}

const BuildItem: React.FC<{ run: WorkflowRun; isLast: boolean }> = ({ run, isLast }) => {
    const getStatusIcon = () => {
        if (run.status === 'queued' || run.status === 'in_progress') {
            return <Loader2 size={18} className="text-yellow-500 animate-spin bg-white dark:bg-base-900 rounded-full" />;
        }
        switch (run.conclusion) {
            case 'success': return <CheckCircle2 size={18} className="text-green-500 bg-white dark:bg-base-900 rounded-full" />;
            case 'failure': return <XCircle size={18} className="text-red-500 bg-white dark:bg-base-900 rounded-full" />;
            case 'cancelled': return <AlertCircle size={18} className="text-gray-400 bg-white dark:bg-base-900 rounded-full" />;
            case 'timed_out': return <AlertCircle size={18} className="text-orange-500 bg-white dark:bg-base-900 rounded-full" />;
            default: return <AlertCircle size={18} className="text-gray-400 bg-white dark:bg-base-900 rounded-full" />;
        }
    };

    return (
        <div className="flex gap-4 group hover:bg-base-50 dark:hover:bg-base-800/50 p-3 rounded-lg transition-colors -mx-2">
            <div className="flex flex-col items-center flex-shrink-0 w-8 pt-1">
                <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-base-100 dark:bg-base-800 border border-base-200 dark:border-base-700 text-gray-500">
                    <PlayCircle size={16} />
                    <div className="absolute -bottom-1 -right-1">
                        {getStatusIcon()}
                    </div>
                </div>
                {!isLast && <div className="w-0.5 bg-base-200 dark:bg-base-800 flex-grow my-2 group-hover:bg-primary/20 transition-colors"></div>}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                             {/* Title Container - allows marquee on hover */}
                             <a 
                                href={run.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors block overflow-hidden whitespace-nowrap max-w-full"
                             >
                                <span className="block truncate group-hover:animate-marquee">{run.display_title || run.name}</span>
                             </a>

                             <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border flex-shrink-0
                                ${run.conclusion === 'success' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900' :
                                  run.conclusion === 'failure' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900' :
                                  run.status === 'in_progress' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900' :
                                  'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'}
                             `}>
                                 {run.status === 'completed' ? run.conclusion : run.status.replace('_', ' ')}
                             </span>
                         </div>
                         
                         <div className="text-sm text-gray-600 dark:text-base-400 space-y-1">
                             <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                                <span className="font-medium text-gray-500">#{run.run_number}</span>
                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                <span className="font-medium truncate max-w-[150px]">{run.name}</span>
                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                <span className="flex items-center gap-1 font-mono text-xs bg-base-100 dark:bg-base-800 px-1.5 py-0.5 rounded border border-base-200 dark:border-base-700">
                                    <GitBranch size={10} /> {run.head_branch}
                                </span>
                             </div>
                         </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 text-xs text-gray-500 flex-shrink-0 mt-1 sm:mt-0">
                        <div className="flex items-center gap-1.5" title={`Triggered by ${run.actor.login}`}>
                            <span className="font-medium hidden sm:inline">{run.actor.login}</span>
                            <img src={run.actor.avatar_url} alt={run.actor.login} className="w-5 h-5 rounded-full border border-base-200 dark:border-base-700" />
                            <span className="font-medium sm:hidden">{run.actor.login}</span>
                        </div>
                        <div className="flex items-center gap-1">
                             <Clock size={12} />
                             <span>{formatRelativeTime(run.created_at)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BuildList: React.FC<BuildListProps> = ({ owner, repo }) => {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchRuns = useCallback(() => {
    setLoading(true);
    githubApi.getWorkflowRuns(owner, repo, page)
      .then(response => {
        const newRuns = response.data.workflow_runs;
        setRuns(prev => page === 1 ? newRuns : [...prev, ...newRuns]);
        if (newRuns.length < 15) {
          setHasMore(false);
        }
      })
      .catch((err) => {
        if (err.response?.status !== 404) {
             setError('Failed to fetch workflow runs.');
        } else {
             setHasMore(false);
        }
      })
      .finally(() => setLoading(false));
  }, [owner, repo, page]);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  if (error) {
    return <div className="text-center py-10 text-red-500 flex flex-col items-center"><ServerCrash size={48} className="mb-4" /><p>{error}</p></div>;
  }

  return (
    <div className="animate-fade-in pl-2 pr-2">
      <div className="mb-6 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Build History</h3>
      </div>

       <div className="space-y-1">
        {runs.map((run, index) => (
            <BuildItem 
                key={run.id} 
                run={run} 
                isLast={index === runs.length - 1} 
            />
        ))}
       </div>

      {loading && <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" size={32} /></div>}

      {hasMore && !loading && runs.length > 0 && (
        <div className="text-center pt-6 pb-2">
          <button onClick={() => setPage(p => p + 1)} className="px-5 py-2 text-sm border border-base-300 dark:border-base-700 rounded-lg hover:bg-base-100 dark:hover:bg-base-800 transition font-semibold">
            Load more builds
          </button>
        </div>
      )}

      {!loading && runs.length === 0 && !error && (
        <div className="text-center py-16 px-4 bg-white dark:bg-base-900 rounded-xl border border-base-200 dark:border-base-800 border-dashed">
            <PlayCircle size={40} className="mx-auto text-gray-300 dark:text-base-700 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No builds found</h3>
            <p className="text-gray-500 dark:text-base-400 mt-2">This repository hasn't run any GitHub Actions yet.</p>
        </div>
      )}
    </div>
  );
};

export default BuildList;
