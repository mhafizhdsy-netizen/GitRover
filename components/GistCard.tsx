
import React from 'react';
import { Gist, GistFile } from '../types';
import { FileCode, Bookmark } from 'lucide-react';
import { formatRelativeTime, formatFileSize } from '../utils/formatters';
import { useBookmarks } from '../contexts/BookmarkContext';

interface GistCardProps {
    gist: Gist;
    onClick: () => void;
}

const GistCard: React.FC<GistCardProps> = ({ gist, onClick }) => {
    const { isGistBookmarked, addGist, removeGist } = useBookmarks();
    const isBookmarked = isGistBookmarked(gist.id);

    const handleBookmark = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isBookmarked) {
            removeGist(gist.id);
        } else {
            addGist(gist);
        }
    };

    return (
        <div 
            onClick={onClick}
            className="group relative bg-white dark:bg-base-900 rounded-2xl p-5 shadow-sm border border-base-200 dark:border-base-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-base-100 dark:bg-base-800 rounded-lg text-gray-500 group-hover:text-primary transition-colors flex-shrink-0">
                        <FileCode size={20} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-mono text-sm font-bold text-gray-800 dark:text-gray-100 truncate group-hover:text-primary transition-colors">
                            {Object.keys(gist.files)[0]}
                        </h3>
                         <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            by {gist.owner?.login || 'Anonymous'}
                        </p>
                    </div>
                </div>
                
                 <button
                    onClick={handleBookmark}
                    className={`p-2 rounded-full transition-all duration-200 z-10 flex-shrink-0 ${
                        isBookmarked 
                        ? 'text-primary bg-primary/10' 
                        : 'text-gray-400 hover:bg-base-100 dark:hover:bg-base-800 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                    title={isBookmarked ? "Remove from bookmarks" : "Bookmark this gist"}
                >
                    <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
                </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-base-400 line-clamp-2 h-10 mb-4 leading-relaxed">
                {gist.description || "No description provided."}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 pt-3 border-t border-base-100 dark:border-base-800/50">
                <span className="flex items-center gap-1">
                    {formatRelativeTime(gist.created_at)}
                </span>
                <div className="flex items-center gap-2">
                    <span className="bg-base-100 dark:bg-base-800 px-2 py-0.5 rounded-full">
                        {Object.keys(gist.files).length} files
                    </span>
                    <span>{formatFileSize((Object.values(gist.files) as GistFile[]).reduce((acc, f) => acc + f.size, 0))}</span>
                </div>
            </div>
        </div>
    );
};

export default GistCard;
