
import React from 'react';
import { Link } from 'react-router-dom';
import { Repo } from '../types';
import { Star, GitFork, Bookmark } from 'lucide-react';
import { formatNumber } from '../utils/formatters';
import { useBookmarks } from '../contexts/BookmarkContext';

interface RepoCardProps {
  repo: Repo;
}

const RepoCard: React.FC<RepoCardProps> = ({ repo }) => {
  const { isRepoBookmarked, addRepo, removeRepo } = useBookmarks();
  const isBookmarked = isRepoBookmarked(repo.id);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBookmarked) {
        removeRepo(repo.id);
    } else {
        addRepo(repo);
    }
  };

  return (
    <div className="group relative h-full flex flex-col bg-white dark:bg-base-900 rounded-2xl p-5 shadow-sm border border-base-200 dark:border-base-800 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-xl hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-primary/5 animate-fade-in">
        
        <Link 
            to={`/repo/${repo.full_name}`} 
            className="absolute inset-0 z-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-base-900"
            aria-label={`View repository ${repo.full_name}`}
        />

        <div className="flex justify-between items-start mb-2 relative z-10 pointer-events-none">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 truncate pr-2 group-hover:text-primary transition-colors duration-300 flex-1">
                {repo.name}
            </h3>

            <div className="flex items-center gap-2 pointer-events-auto">
                {repo.language && (
                    <span className="flex-shrink-0 flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-base-100 dark:bg-base-800 text-gray-600 dark:text-gray-300 border border-base-200 dark:border-base-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mr-1.5 animate-pulse"></span>
                        {repo.language}
                    </span>
                )}
                
                <button
                    onClick={handleBookmark}
                    className={`p-1.5 rounded-full transition-all duration-200 ${
                        isBookmarked 
                        ? 'text-primary bg-primary/10' 
                        : 'text-gray-400 hover:bg-base-100 dark:hover:bg-base-800 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                    title={isBookmarked ? "Remove from bookmarks" : "Bookmark this repo"}
                >
                    <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
                </button>
            </div>
        </div>

        <div className="relative z-0 pointer-events-none flex-grow flex flex-col">
            <p className="text-gray-600 dark:text-base-300 text-sm h-10 overflow-hidden line-clamp-2 leading-relaxed mb-3">
                {repo.description || "No description provided."}
            </p>

            {repo.topics && repo.topics.length > 0 && (
                <div className="mt-auto flex flex-wrap gap-1.5 opacity-80">
                    {repo.topics.slice(0, 3).map((topic) => (
                    <span 
                        key={topic} 
                        className="px-2 py-0.5 text-[10px] font-medium bg-base-50 text-gray-600 dark:bg-base-800 dark:text-gray-400 rounded-md border border-base-200 dark:border-base-700"
                    >
                        {topic}
                    </span>
                    ))}
                    {repo.topics.length > 3 && (
                        <span className="text-[10px] text-gray-400 flex items-center">+{repo.topics.length - 3}</span>
                    )}
                </div>
            )}
        </div>
        
        <div className="my-4 border-t border-base-100 dark:border-base-800/50 relative z-0"></div>

        <div className="mt-auto flex items-center justify-between">
            <div className="relative z-10 flex items-center min-w-0 mr-4">
                <Link 
                    to={`/profile/${repo.owner.login}`} 
                    className="flex items-center gap-2 hover:bg-base-100 dark:hover:bg-base-800 rounded-full pr-3 pl-1 py-1 -ml-1 transition-colors group/user max-w-full"
                >
                    <img 
                        src={repo.owner.avatar_url} 
                        alt={repo.owner.login} 
                        className="w-5 h-5 rounded-full border border-base-200 dark:border-base-700 flex-shrink-0" 
                    />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover/user:text-primary transition-colors truncate">
                        {repo.owner.login}
                    </span>
                </Link>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 relative z-0 pointer-events-none flex-shrink-0">
                <div className="flex items-center" title="Stars">
                    <Star size={14} className="mr-1 text-yellow-500 fill-yellow-500" />
                    {formatNumber(repo.stargazers_count)}
                </div>
                <div className="flex items-center" title="Forks">
                    <GitFork size={14} className="mr-1" />
                    {formatNumber(repo.forks_count)}
                </div>
            </div>
        </div>
    </div>
  );
};

export default RepoCard;
