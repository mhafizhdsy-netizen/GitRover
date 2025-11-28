import React, { useState, useEffect } from 'react';
import { githubApi } from '../services/githubApi';
import { Deployment, DeploymentStatus } from '../types';
import { Rocket, CheckCircle2, XCircle, AlertCircle, Clock, Globe, ServerCrash, GitCommit } from 'lucide-react';
import { formatRelativeTime } from '../utils/formatters';
import CustomLoader from './common/CustomLoader';

interface DeploymentListProps {
  owner: string;
  repo: string;
}

const DeploymentItem: React.FC<{ deployment: Deployment; owner: string; repo: string; isLast: boolean }> = ({ deployment, owner, repo, isLast }) => {
    const [status, setStatus] = useState<DeploymentStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        githubApi.getDeploymentStatuses(owner, repo, deployment.id)
            .then(res => {
                if (isMounted && res.data.length > 0) {
                    setStatus(res.data[0]);
                }
            })
            .catch(err => console.error("Failed to fetch deployment status", err))
            .finally(() => {
                if (isMounted) setLoading(false);
            });
        return () => { isMounted = false; };
    }, [deployment.id, owner, repo]);

    const getStatusIcon = () => {
        if (loading) return <div className="w-4 h-4 rounded-full border-2 border-gray-400 border-t-transparent animate-spin"></div>;
        const state = status?.state;
        if (state === 'success') return <CheckCircle2 size={18} className="text-green-500 bg-white dark:bg-base-900 rounded-full" />;
        if (state === 'failure' || state === 'error') return <XCircle size={18} className="text-red-500 bg-white dark:bg-base-900 rounded-full" />;
        return <AlertCircle size={18} className="text-gray-400 bg-white dark:bg-base-900 rounded-full" />;
    };

    return (
        <div className="flex gap-4 group hover:bg-base-50 dark:hover:bg-base-800/50 p-3 rounded-lg transition-colors -mx-2">
            <div className="flex flex-col items-center flex-shrink-0 w-8 pt-1">
                <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-base-100 dark:bg-base-800 border border-base-200 dark:border-base-700 text-gray-500">
                    <Rocket size={16} />
                    <div className="absolute -bottom-1 -right-1">
                        {getStatusIcon()}
                    </div>
                </div>
                {!isLast && <div className="w-0.5 bg-base-200 dark:bg-base-800 flex-grow my-2"></div>}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                         <div className="flex flex-wrap items-center gap-2 mb-1.5">
                             <span className="font-semibold text-gray-900 dark:text-white truncate max-w-full">
                                 Deployed to <span className="font-bold text-primary">{deployment.environment}</span>
                             </span>
                             <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border
                                ${status?.state === 'success' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900' :
                                  status?.state === 'failure' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900' :
                                  'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'}
                             `}>
                                 {loading ? '...' : status?.state || 'Pending'}
                             </span>
                         </div>
                         
                         <div className="text-sm text-gray-600 dark:text-base-400 space-y-1.5">
                             <div className="flex items-center gap-2 text-xs">
                                <span className="flex items-center gap-1 font-mono bg-base-100 dark:bg-base-800 px-1.5 py-0.5 rounded border border-base-200 dark:border-base-700">
                                    <GitCommit size={10} /> 
                                    {deployment.sha.substring(0, 7)}
                                </span>
                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                <span className="truncate max-w-[200px]">{deployment.ref}</span>
                             </div>
                             {deployment.description && (
                                 <p className="text-gray-500 italic text-xs truncate group-hover:animate-marquee overflow-hidden whitespace-nowrap">
                                     "{deployment.description}"
                                 </p>
                             )}
                         </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 text-xs text-gray-500 flex-shrink-0 mt-1 sm:mt-0">
                        <div className="flex items-center gap-1.5" title={`Deployed by ${deployment.creator.login}`}>
                             <span className="font-medium hidden sm:inline">{deployment.creator.login}</span>
                            <img src={deployment.creator.avatar_url} alt={deployment.creator.login} className="w-5 h-5 rounded-full border border-base-200 dark:border-base-700" />
                            <span className="font-medium sm:hidden">{deployment.creator.login}</span>
                        </div>
                        <div className="flex items-center gap-1">
                             <Clock size={12} />
                            <span>{formatRelativeTime(deployment.created_at)}</span>
                        </div>
                    </div>
                </div>

                {status?.target_url && (
                    <div className="mt-3">
                        <a 
                            href={status.target_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded-md border border-primary/10 hover:border-primary/30 transition-colors"
                        >
                            <Globe size={12} />
                            View active deployment
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

const DeploymentList: React.FC<DeploymentListProps> = ({ owner, repo }) => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setDeployments([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [owner, repo]);

  useEffect(() => {
    setLoading(true);
    githubApi.getDeployments(owner, repo, page)
      .then(response => {
        setDeployments(prev => page === 1 ? response.data : [...prev, ...response.data]);
        if (response.data.length < 10) {
          setHasMore(false);
        }
      })
      .catch((err) => {
         if (err.response?.status !== 404) {
             setError('Failed to fetch deployments.');
        } else {
             setHasMore(false);
        }
      })
      .finally(() => setLoading(false));
  }, [owner, repo, page]);

  if (error) {
    return <div className="text-center py-10 text-red-500 flex flex-col items-center"><ServerCrash size={48} className="mb-4" /><p>{error}</p></div>;
  }

  return (
    <div className="animate-fade-in pl-2 pr-2">
      <div className="mb-6 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deployment Activity</h3>
      </div>
      
      <div className="space-y-1">
        {deployments.map((deployment, index) => (
            <DeploymentItem 
                key={deployment.id} 
                deployment={deployment} 
                owner={owner} 
                repo={repo} 
                isLast={index === deployments.length - 1} 
            />
        ))}
      </div>

      {loading && <div className="flex justify-center py-8"><CustomLoader size={48} /></div>}

      {hasMore && !loading && deployments.length > 0 && (
        <div className="text-center pt-6 pb-2">
          <button onClick={() => setPage(p => p + 1)} className="px-5 py-2 text-sm border border-base-300 dark:border-base-700 rounded-lg hover:bg-base-100 dark:hover:bg-base-800 transition font-semibold">
            Load more deployments
          </button>
        </div>
      )}

      {!loading && deployments.length === 0 && !error && (
        <div className="text-center py-16 px-4 bg-white dark:bg-base-900 rounded-xl border border-base-200 dark:border-base-800 border-dashed">
            <Rocket size={40} className="mx-auto text-gray-300 dark:text-base-700 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No deployments found</h3>
            <p className="text-gray-500 dark:text-base-400 mt-2">This repository hasn't tracked any deployments yet.</p>
        </div>
      )}
    </div>
  );
};

export default DeploymentList;