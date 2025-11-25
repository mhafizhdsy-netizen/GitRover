import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { githubApi } from '../services/githubApi';
import { Issue } from '../types';
import { Loader2, AlertCircle, CircleDot, ServerCrash } from 'lucide-react';
import { formatRelativeTime } from '../utils/formatters';

interface IssueListProps {
  owner: string;
  repo: string;
}

const IssueList: React.FC<IssueListProps> = ({ owner, repo }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const fetchIssues = useCallback(() => {
    setLoading(true);
    githubApi.getIssues(owner, repo, page)
      .then(response => {
        setIssues(prev => page === 1 ? response.data : [...prev, ...response.data]);
        if (response.data.length < 20) {
          setHasMore(false);
        }
      })
      .catch((err) => {
        setError('Failed to fetch issues.');
      })
      .finally(() => setLoading(false));
  }, [owner, repo, page]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  if (error) {
    return <div className="text-center py-10 text-red-500 flex flex-col items-center"><ServerCrash size={48} className="mb-4" /><p>{error}</p></div>;
  }

  return (
    <div>
      <ul className="border border-gray-200 dark:border-gray-700 rounded-lg">
        {issues.map((issue, index) => (
          <li key={issue.id} className={`p-4 flex items-start space-x-4 ${index < issues.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
            {issue.state === 'open' ? (
                <AlertCircle className="text-green-600 mt-1 flex-shrink-0" />
            ) : (
                <CircleDot className="text-purple-600 mt-1 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <span className="font-medium text-gray-800 dark:text-gray-100">
                {issue.title}
              </span>
              <div className="flex flex-wrap gap-1 mt-2">
                {issue.labels.map(label => (
                    <span key={label.name} className="px-2 py-0.5 text-xs rounded-full font-medium" style={{ backgroundColor: `#${label.color}20`, color: `#${label.color}` }}>
                        {label.name}
                    </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                #{issue.number} opened {formatRelativeTime(issue.created_at)} by{' '}
                <Link to={`/profile/${issue.user.login}`} className="hover:underline text-blue-600 dark:text-blue-400">{issue.user.login}</Link>
              </p>
            </div>
          </li>
        ))}
      </ul>
      
      {loading && <div className="flex justify-center py-4"><Loader2 className="animate-spin" /></div>}
      
      {hasMore && !loading && issues.length > 0 && (
        <div className="text-center mt-4">
          <button onClick={() => setPage(p => p + 1)} className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            Load more
          </button>
        </div>
      )}

      {!loading && issues.length === 0 && !error &&(
        <div className="text-center p-8 text-gray-500">No open issues</div>
      )}
    </div>
  );
};

export default IssueList;