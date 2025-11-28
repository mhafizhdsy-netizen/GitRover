
import React, { useState } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useBookmarks } from '../contexts/BookmarkContext';
import RepoCard from '../components/RepoCard';
import GistCard from '../components/GistCard';
import { Bookmark, LayoutGrid, FileCode, FolderOpen } from 'lucide-react';
import GistViewerModal from '../components/GistViewerModal';

const BookmarksPage: React.FC = () => {
  const { bookmarkedRepos, bookmarkedGists } = useBookmarks();
  const [activeTab, setActiveTab] = useState<'repos' | 'gists'>('repos');
  const [selectedGistId, setSelectedGistId] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-base-50 dark:bg-base-950">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="mb-12 animate-fade-in">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                        <Bookmark size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
                        Local Bookmarks
                    </h1>
                </div>
                <p className="text-lg text-gray-600 dark:text-base-300 max-w-2xl">
                    Your personal collection of repositories and gists, stored securely in your browser. Access your favorite projects instantly.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-base-200 dark:border-base-800 mb-8 animate-fade-in">
                <button
                    onClick={() => setActiveTab('repos')}
                    className={`flex items-center gap-2 pb-3 px-1 text-sm font-semibold transition-all relative ${
                        activeTab === 'repos' 
                        ? 'text-primary' 
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                >
                    <LayoutGrid size={18} />
                    Repositories
                    <span className="bg-base-200 dark:bg-base-800 text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
                        {bookmarkedRepos.length}
                    </span>
                    {activeTab === 'repos' && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('gists')}
                    className={`flex items-center gap-2 pb-3 px-1 text-sm font-semibold transition-all relative ${
                        activeTab === 'gists' 
                        ? 'text-primary' 
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                >
                    <FileCode size={18} />
                    Gists
                    <span className="bg-base-200 dark:bg-base-800 text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
                        {bookmarkedGists.length}
                    </span>
                    {activeTab === 'gists' && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
                    )}
                </button>
            </div>

            {/* Content Area */}
            <div className="animate-fade-in">
                {activeTab === 'repos' ? (
                    bookmarkedRepos.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bookmarkedRepos.map(repo => (
                                <RepoCard key={repo.id} repo={repo} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-base-200 dark:border-base-800 rounded-3xl">
                            <div className="w-16 h-16 bg-base-100 dark:bg-base-900 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                <FolderOpen size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No repositories saved yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                Explore repositories and click the bookmark icon to save them here for quick access.
                            </p>
                            <a href="/#/search" className="mt-6 px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                                Explore Repositories
                            </a>
                        </div>
                    )
                ) : (
                    bookmarkedGists.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bookmarkedGists.map(gist => (
                                <GistCard key={gist.id} gist={gist} onClick={() => setSelectedGistId(gist.id)} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-base-200 dark:border-base-800 rounded-3xl">
                            <div className="w-16 h-16 bg-base-100 dark:bg-base-900 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                <FileCode size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No gists saved yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                Save useful code snippets and gists to access them anytime without searching.
                            </p>
                        </div>
                    )
                )}
            </div>
        </div>
      </main>
      <Footer />

      {selectedGistId && (
        <GistViewerModal 
            gistId={selectedGistId} 
            onClose={() => setSelectedGistId(null)} 
        />
      )}
    </div>
  );
};

export default BookmarksPage;
