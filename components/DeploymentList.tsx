
import React, { useState, useEffect, useCallback } from 'react';
import { githubApi } from '../services/githubApi';
import { Deployment, DeploymentStatus } from '../types';
import { Loader2, Rocket, CheckCircle2, XCircle, AlertCircle, Clock, Globe, ServerCrash, GitCommit } from 'lucide-react';
import { formatRelativeTime } from '../utils/formatters';

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
        if (loading) return <Loader2 size={16} className="text-gray-400 animate-spin" />;
        const state = status?.state;
        if (state === 'success') return <CheckCircle2 size={18} className="text-green-500 bg-white dark:bg-base-900 rounded-full" />;
        if (state === 'failure' || state === 'error') return <XCircle size={18} className="text-red-500 bg-white dark:bg-base-900 rounded-full" />;
        return <AlertCircle size={18} className="text-gray-400 bg-white dark:bg-base-900 rounded-full" />;
    };

    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center flex-shrink-0 w-8">
                <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-base-100 dark:bg-base-800 border border-base-200 dark:border-base-700 text-gray-500">
                    <Rocket size={16} />
                    <div className="absolute -bottom-1 -right-1">
                        {getStatusIcon()}
                    </div>
                </div>
                {!isLast && <div className="w-0.5 bg-base-200 dark:bg-base-800 flex-grow my-2"></div>}
            </div>

            <div className="flex-1 pb-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                         <div className="flex items-center gap-2 mb-1">
                             <span className="font-semibold text-gray-900 dark:text-white">
                                 Deployed to <span className="font-bold">{deployment.environment}</span>
                             </span>
                             <span className={`text-xs px-2 py-0.5 rounded-full font-medium border
                                ${status?.state === 'success' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900' :
                                  status?.state === 'failure' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900' :
                                  'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'}
                             `}>
                                 {loading ? '...' : status?.state || 'Pending'}
                             </span>
                         </div>
                         
                         <div className="text-sm text-gray-600 dark:text-base-400 space-y-1">
                             <div className="flex items-center gap-2">
                                <GitCommit size={14} />
                                <span className="font-mono text-xs">{deployment.sha.substring(0, 7)}</span>
                                <span className="text-gray-400">•</span>
                                <span>{deployment.ref}</span>
                             </div>
                             {deployment.description && (
                                 <p className="text-gray-500 italic">"{deployment.description}"</p>
                             )}
                         </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5" title={`Deployed by ${deployment.creator.login}`}>
                            <img src={deployment.creator.avatar_url} alt={deployment.creator.login} className="w-5 h-5 rounded-full border border-base-200 dark:border-base-700" />
                            <span className="font-medium">{deployment.creator.login}</span>
                        </div>
                        <span>{formatRelativeTime(deployment.created_at)}</span>
                    </div>
                </div>

                {status?.target_url && (
                    <div className="mt-3">
                        <a 
                            href={status.target_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded-md border border-primary/10"
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

  const fetchDeployments = useCallback(() => {
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

  useEffect(() => {
    fetchDeployments();
  }, [fetchDeployments]);

  if (error) {
    return <div className="text-center py-10 text-red-500 flex flex-col items-center"><ServerCrash size={48} className="mb-4" /><p>{error}</p></div>;
  }

  return (
    <div className="animate-fade-in pl-2">
      <div className="mb-6 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deployment Activity</h3>
      </div>
      
      {deployments.map((deployment, index) => (
          <DeploymentItem 
            key={deployment.id} 
            deployment={deployment} 
            owner={owner} 
            repo={repo} 
            isLast={index === deployments.length - 1} 
          />
      ))}

      {loading && <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" size={32} /></div>}

      {hasMore && !loading && deployments.length > 0 && (
        <div className="text-center pt-4">
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
