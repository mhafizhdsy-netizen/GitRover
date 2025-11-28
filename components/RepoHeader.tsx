
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Repo } from '../types';
import { Star, GitFork, Eye, Scale, ChevronDown, Code, Bookmark } from 'lucide-react';
import { formatNumber } from '../utils/formatters';
import { useBookmarks } from '../contexts/BookmarkContext';
import CloneModal from './CloneModal';

interface RepoHeaderProps {
  repo: Repo;
}

const RepoHeader: React.FC<RepoHeaderProps> = ({ repo }) => {
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const { isRepoBookmarked, addRepo, removeRepo } = useBookmarks();
  const isBookmarked = isRepoBookmarked(repo.id);

  const forkUrl = `${repo.html_url}/fork`;

  const toggleBookmark = () => {
    if(isBookmarked) {
        removeRepo(repo.id);
    } else {
        addRepo(repo);
    }
  }

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-2">
            <Link to={`/profile/${repo.owner.login}`}>
              <img src={repo.owner.avatar_url} alt={repo.owner.login} className="w-8 h-8 rounded-full mr-3" />
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 break-all flex flex-wrap items-center">
              <Link to={`/profile/${repo.owner.login}`} className="hover:underline hover:text-primary transition-colors">{repo.owner.login}</Link>
              <span className="mx-2 text-gray-400 dark:text-gray-500">/</span>
              <Link to={`/repo/${repo.full_name}`} className="font-bold hover:underline hover:text-primary transition-colors">{repo.name}</Link>
              <span className="ml-3 px-2 py-0.5 text-xs border border-base-300 dark:border-base-700 text-gray-500 rounded-full font-medium">
                Public
              </span>
            </h1>
          </div>
          
          {repo.description && <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-3xl leading-relaxed">{repo.description}</p>}
          
          <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400 flex-wrap gap-y-2">
            <span className="flex items-center hover:text-primary transition-colors cursor-default">
              <Star size={16} className="mr-1.5 text-yellow-500" />
              <strong>{formatNumber(repo.stargazers_count)}</strong>&nbsp;stars
            </span>
            <span className="flex items-center hover:text-primary transition-colors cursor-default">
              <GitFork size={16} className="mr-1.5" />
              <strong>{formatNumber(repo.forks_count)}</strong>&nbsp;forks
            </span>
            <span className="flex items-center hover:text-primary transition-colors cursor-default">
              <Eye size={16} className="mr-1.5" />
              <strong>{formatNumber(repo.watchers_count)}</strong>&nbsp;watching
            </span>
            {repo.license && (
              <span className="flex items-center hover:text-primary transition-colors cursor-default">
                <Scale size={16} className="mr-1.5" />
                {repo.license.name}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={toggleBookmark}
            className={`flex items-center justify-center px-3 py-2 border rounded-lg font-semibold text-sm transition-colors shadow-sm
              ${isBookmarked 
                  ? 'bg-primary/10 border-primary text-primary hover:bg-primary/20' 
                  : 'bg-base-100 dark:bg-base-800 border-base-300 dark:border-base-700 hover:bg-base-200 dark:hover:bg-base-700 text-gray-700 dark:text-gray-200'
              }`}
            title={isBookmarked ? "Remove from Bookmarks" : "Add to Bookmarks"}
          >
            <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
          </button>

          <a
            href={forkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-4 py-2 bg-base-100 dark:bg-base-800 border border-base-300 dark:border-base-700 hover:bg-base-200 dark:hover:bg-base-700 text-gray-700 dark:text-gray-200 rounded-lg font-semibold text-sm transition-colors shadow-sm"
          >
            <GitFork size={16} className="mr-2" />
            Fork
          </a>

          <button
            onClick={() => setIsCloneModalOpen(true)}
            className="flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm"
          >
            <Code size={16} className="mr-2" />
            Code
            <ChevronDown size={16} className="ml-2" />
          </button>
        </div>
      </header>
      {isCloneModalOpen && <CloneModal repo={repo} onClose={() => setIsCloneModalOpen(false)} />}
    </>
  );
};

export default RepoHeader;
