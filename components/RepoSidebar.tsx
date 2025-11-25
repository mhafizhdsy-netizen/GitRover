
import React from 'react';
import { Link } from 'react-router-dom';
import { Repo, Contributor } from '../types';
import { formatNumber } from '../utils/formatters';
import { Scale, Users, Link as LinkIcon, Tag } from 'lucide-react';
import AISidebarFeatures from './AISidebarFeatures';

interface RepoSidebarProps {
  repo: Repo;
  languages: Record<string, number> | null;
  contributors: Contributor[];
  readmeContent: string | null;
}

const LanguageBar: React.FC<{ languages: Record<string, number> }> = ({ languages }) => {
  const total = (Object.values(languages) as number[]).reduce((acc, val) => acc + val, 0);
  if (total === 0) return null;

  const languageColors: { [key: string]: string } = {
    'typescript': '#3178c6', 'javascript': '#f1e05a', 'python': '#3572A5',
    'java': '#b07219', 'c++': '#f34b7d', 'c#': '#178600', 'php': '#4F5D95',
    'c': '#555555', 'html': '#e34c26', 'css': '#563d7c', 'shell': '#89e051',
    'go': '#00ADD8', 'ruby': '#701516', 'rust': '#dea584', 'swift': '#ffac45',
    'kotlin': '#F18E33', 'default': '#cccccc'
  };

  const sortedLanguages = (Object.entries(languages) as [string, number][])
    .sort(([, a], [, b]) => b - a);

  return (
    <div>
      <div className="flex w-full h-2 rounded-full overflow-hidden mt-2 bg-gray-200 dark:bg-gray-700">
        {sortedLanguages
          .map(([lang, count]) => (
            <div
              key={lang}
              className="h-full"
              style={{
                width: `${(count / total) * 100}%`,
                backgroundColor: languageColors[lang.toLowerCase()] || languageColors.default,
              }}
              title={`${lang}: ${((count / total) * 100).toFixed(1)}%`}
            />
          ))}
      </div>
      <ul className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
        {sortedLanguages
          .slice(0, 5) // Show top 5 languages
          .map(([lang, count]) => (
          <li key={lang} className="flex items-center">
            <span className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: languageColors[lang.toLowerCase()] || languageColors.default }}></span>
            <span className="font-semibold mr-1">{lang}</span>
            <span>{((count / total) * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const RepoSidebar: React.FC<RepoSidebarProps> = ({ repo, languages, contributors, readmeContent }) => {
  return (
    <div className="space-y-6">
      <AISidebarFeatures repo={repo} readmeContent={readmeContent} />

      <div>
        <h3 className="text-sm font-semibold mb-3 text-gray-800 dark:text-gray-100 uppercase tracking-wider">About</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{repo.description || "No description provided."}</p>
        {repo.homepage && (
            <a href={repo.homepage} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline mt-3 break-all font-medium">
                <LinkIcon size={14} className="mr-1.5 flex-shrink-0" />
                {repo.homepage}
            </a>
        )}
      </div>

      {repo.topics && repo.topics.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 text-gray-800 dark:text-gray-100 uppercase tracking-wider flex items-center">
             Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {repo.topics.map((topic) => (
              <span key={topic} className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900/50 text-xs font-medium rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-default">
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {languages && Object.keys(languages).length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 text-gray-800 dark:text-gray-100 uppercase tracking-wider">Languages</h3>
          <LanguageBar languages={languages} />
        </div>
      )}

      {repo.license && (
        <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-100 uppercase tracking-wider">License</h3>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Scale size={16} className="mr-2" />
                <span>{repo.license.name}</span>
            </div>
        </div>
      )}

      {contributors && contributors.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 text-gray-800 dark:text-gray-100 uppercase tracking-wider flex items-center justify-between">
            <span>Contributors</span>
            <span className="text-xs font-normal bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">{formatNumber(contributors.length)}</span>
          </h3>
          <div className="flex flex-wrap gap-1">
            {contributors.slice(0, 14).map(c => (
              <Link key={c.id} to={`/profile/${c.login}`} title={c.login} className="hover:opacity-75 transition-opacity">
                <img
                  src={c.avatar_url}
                  alt={c.login}
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-base-200"
                />
              </Link>
            ))}
            {contributors.length > 14 && (
                <div className="w-8 h-8 rounded-full bg-base-200 dark:bg-base-800 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium text-gray-500">
                    +{contributors.length - 14}
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
