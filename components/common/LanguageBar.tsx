
import React from 'react';

interface LanguageBarProps {
  languages: Record<string, number>;
}

const LanguageBar: React.FC<LanguageBarProps> = ({ languages }) => {
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
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400">
        {sortedLanguages
          .slice(0, 6) // Show top 6 languages
          .map(([lang, count]) => (
          <li key={lang} className="flex items-center truncate">
            <span className="h-2 w-2 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: languageColors[lang.toLowerCase()] || languageColors.default }}></span>
            <span className="font-semibold mr-1.5 text-gray-700 dark:text-gray-300">{lang}</span>
            <span className="truncate">{((count / total) * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LanguageBar;
