
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Repo } from '../types';
import { Star, GitFork, Eye, Scale, Download, Copy, ChevronDown, Code } from 'lucide-react';
import { formatNumber } from '../utils/formatters';
import { useToast } from '../contexts/ToastContext';

interface RepoHeaderProps {
  repo: Repo;
}

const RepoHeader: React.FC<RepoHeaderProps> = ({ repo }) => {
  const [isCodeOpen, setIsCodeOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  const cloneUrl = repo.clone_url || `https://github.com/${repo.full_name}.git`;
  const downloadUrl = `${repo.html_url}/archive/refs/heads/${repo.default_branch || 'main'}.zip`;
  const forkUrl = `${repo.html_url}/fork`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCodeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyCloneUrl = () => {
    navigator.clipboard.writeText(cloneUrl);
    addToast('Clone URL copied to clipboard', 'success');
  };

  return (
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
        <a
          href={forkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center px-4 py-2 bg-base-100 dark:bg-base-800 border border-base-300 dark:border-base-700 hover:bg-base-200 dark:hover:bg-base-700 text-gray-700 dark:text-gray-200 rounded-lg font-semibold text-sm transition-colors shadow-sm"
        >
          <GitFork size={16} className="mr-2" />
          Fork
        </a>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsCodeOpen(!isCodeOpen)}
            className="flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm"
          >
            <Code size={16} className="mr-2" />
            Code
            <ChevronDown size={16} className="ml-2" />
          </button>

          {isCodeOpen && (
            <div className="absolute left-0 md:left-auto md:right-0 top-full mt-2 w-72 bg-white dark:bg-base-900 border border-base-200 dark:border-base-700 rounded-xl shadow-xl z-20 overflow-hidden animate-fade-in">
              <div className="p-3">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-1">Clone</h3>
                <div className="flex items-center mb-3">
                  <input 
                    readOnly 
                    value={cloneUrl} 
                    className="flex-1 min-w-0 bg-base-100 dark:bg-base-800 text-xs p-2 rounded-l-md border border-r-0 border-base-300 dark:border-base-700 text-gray-600 dark:text-gray-300 focus:outline-none"
                  />
                  <button 
                    onClick={handleCopyCloneUrl}
                    className="p-2 bg-base-100 dark:bg-base-800 border border-l-0 border-base-300 dark:border-base-700 rounded-r-md hover:bg-base-200 dark:hover:bg-base-700 transition-colors"
                    title="Copy URL"
                  >
                    <Copy size={14} className="text-gray-500" />
                  </button>
                </div>
                
                <div className="border-t border-base-200 dark:border-base-800 my-2"></div>
                
                <a 
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center w-full px-2 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-base-100 dark:hover:bg-base-800 rounded-md transition-colors"
                >
                  <Download size={16} className="mr-2.5 text-gray-500" />
                  Download ZIP
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default RepoHeader;
