
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { githubApi } from '../services/githubApi';
import { PullRequest } from '../types';
import { GitPullRequest, GitMerge, GitPullRequestClosed, ServerCrash } from 'lucide-react';
import { formatRelativeTime } from '../utils/formatters';
import CustomLoader from './common/CustomLoader';

interface PullRequestListProps {
  owner: string;
  repo: string;
}

const PullRequestList: React.FC<PullRequestListProps> = ({ owner, repo }) => {
  const [pulls, setPulls] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPulls = useCallback(() => {
    setLoading(true);
    githubApi.getPullRequests(owner, repo, page)
      .then(response => {
        setPulls(prev => page === 1 ? response.data : [...prev, ...response.data]);
        if (response.data.length < 20) {
          setHasMore(false);
        }
      })
      .catch((err) => {
        setError('Failed to fetch pull requests.');
      })
      .finally(() => setLoading(false));
  }, [owner, repo, page]);

  useEffect(() => {
    fetchPulls();
  }, [fetchPulls]);
  
  if (error) {
    return <div className="text-center py-10 text-red-500 flex flex-col items-center"><ServerCrash size={48} className="mb-4" /><p>{error}</p></div>;
  }

  return (
    <div className="animate-fade-in">
      <ul className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {pulls.map((pr, index) => (
          <li key={pr.id} className={`p-4 flex items-start space-x-4 hover:bg-base-50 dark:hover:bg-base-800/50 transition-colors duration-300 ${index < pulls.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
            {pr.state === 'open' ? (
                <GitPullRequest className="text-green-600 mt-1 flex-shrink-0" />
            ) : (pr as any).merged_at ? (
                <GitMerge className="text-purple-600 mt-1 flex-shrink-0" />
            ) : (
                <GitPullRequestClosed className="text-red-600 mt-1 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <span className="font-medium text-gray-800 dark:text-gray-100 hover:text-primary transition-colors cursor-pointer">
                {pr.title}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                #{pr.number} opened {formatRelativeTime(pr.created_at)} by{' '}
                <Link to={`/profile/${pr.user.login}`} className="hover:underline text-blue-600 dark:text-blue-400">{pr.user.login}</Link>
              </p>
            </div>
          </li>
        ))}
      </ul>

      {loading && <div className="flex justify-center py-8"><CustomLoader size={48} /></div>}

      {hasMore && !loading && pulls.length > 0 && (
        <div className="text-center mt-4">
          <button onClick={() => setPage(p => p + 1)} className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            Load more
          </button>
        </div>
      )}

      {!loading && pulls.length === 0 && !error && (
        <div className="text-center p-8 text-gray-500">No open pull requests</div>
      )}
    </div>
  );
};

export default PullRequestList;
