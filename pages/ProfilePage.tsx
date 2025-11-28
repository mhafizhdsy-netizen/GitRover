
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { githubApi } from '../services/githubApi';
import { UserProfile, Repo, Gist } from '../types';
import { Users, MapPin, Link as LinkIcon, Building, ChevronLeft, ChevronRight, Book, FileCode, LayoutGrid, X, Maximize2 } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import RepoCard from '../components/RepoCard';
import GistCard from '../components/GistCard';
import ErrorDisplay from '../components/common/ErrorDisplay';
import { formatNumber } from '../utils/formatters';
import GistViewerModal from '../components/GistViewerModal';
import CustomLoader from '../components/common/CustomLoader';

const ProfilePageSkeleton: React.FC = () => (
    <div className="container mx-auto px-4 py-8">
        <div className="relative overflow-hidden animate-pulse">
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left space-y-6 md:space-y-0 md:space-x-8 mb-12">
                <div className="w-40 h-40 rounded-full bg-base-200 dark:bg-base-800 flex-shrink-0"></div>
                <div className="flex-1 w-full space-y-4">
                    <div className="h-8 bg-base-200 dark:bg-base-800 rounded-lg w-1/2 mx-auto md:mx-0"></div>
                    <div className="h-5 bg-base-200 dark:bg-base-800 rounded-lg w-1/3 mx-auto md:mx-0"></div>
                    <div className="h-4 bg-base-200 dark:bg-base-800 rounded-lg w-full max-w-lg mx-auto md:mx-0"></div>
                    <div className="flex justify-center md:justify-start space-x-6">
                        <div className="h-5 bg-base-200 dark:bg-base-800 rounded-lg w-24"></div>
                        <div className="h-5 bg-base-200 dark:bg-base-800 rounded-lg w-24"></div>
                    </div>
                </div>
            </div>
            <div className="h-8 bg-base-200 dark:bg-base-800 rounded-lg w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-base-900 p-5 rounded-2xl h-48 border border-base-200 dark:border-base-800">
                        <div className="space-y-3">
                            <div className="h-5 bg-base-200 dark:bg-base-800 rounded-lg w-3/4"></div>
                            <div className="h-3 bg-base-200 dark:bg-base-800 rounded-lg w-full"></div>
                            <div className="h-3 bg-base-200 dark:bg-base-800 rounded-lg w-5/6"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const ProfilePage: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const [searchParams, setSearchParams] = useSearchParams();

    const [user, setUser] = useState<UserProfile | null>(null);
    const [repos, setRepos] = useState<Repo[]>([]);
    const [gists, setGists] = useState<Gist[]>([]);
    const [loading, setLoading] = useState(true);
    const [contentLoading, setContentLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [selectedGistId, setSelectedGistId] = useState<string | null>(null);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const tabParam = searchParams.get('tab');
    const activeTab = (tabParam === 'gists' ? 'gists' : 'repos') as 'repos' | 'gists';
    const [totalPages, setTotalPages] = useState(1);

    const fetchProfile = useCallback(() => {
        if (!username) return;
        setLoading(true);
        setError(null);
        githubApi.getUserProfile(username)
            .then(response => {
                setUser(response.data);
            })
            .catch(err => {
                setError(err);
            })
            .finally(() => setLoading(false));
    }, [username]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        if (user) {
            const count = activeTab === 'repos' ? user.public_repos : user.public_gists;
            const maxPages = count > 0 ? Math.ceil(count / 12) : 1;
            setTotalPages(maxPages);
        }
    }, [user, activeTab]);

    useEffect(() => {
        if (!user || !username) return;
        setContentLoading(true);
        const fetchData = async () => {
            try {
                if (activeTab === 'repos') {
                    const res = await githubApi.getUserRepos(username, page);
                    setRepos(res.data);
                } else {
                    const res = await githubApi.getUserGists(username, page);
                    setGists(res.data);
                }
            } catch (err) {
                if (activeTab === 'repos') setRepos([]);
                else setGists([]);
            } finally {
                setContentLoading(false);
            }
        };
        fetchData();
    }, [username, user, page, activeTab]);

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= totalPages) {
            setSearchParams({ tab: activeTab, page: newPage.toString() });
        }
    };
    
    const handleTabChange = (tab: 'repos' | 'gists') => {
        if (tab !== activeTab) {
            setSearchParams({ tab: tab, page: '1' });
        }
    };

    if (loading) {
        return <div className="flex flex-col min-h-screen"><Header /><div className="flex-grow flex items-center justify-center"><CustomLoader size={80} text="Loading Profile..." /></div><Footer /></div>;
    }

    if (error || !user) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <ErrorDisplay error={error} fullScreen onRetry={fetchProfile} />
                </div>
                <Footer />
            </div>
        );
    }
    
    const renderPagination = () => {
        if (totalPages <= 1) return null;
        return (
            <div className="flex items-center space-x-2">
                <button 
                    onClick={() => handlePageChange(page - 1)} 
                    disabled={page === 1}
                    className="p-2 bg-white dark:bg-base-900 border border-base-300 dark:border-base-700 rounded-lg disabled:opacity-50 hover:bg-base-50 dark:hover:bg-base-800 transition"
                >
                    <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-medium px-2 text-gray-600 dark:text-gray-300">
                    Page {page} of {totalPages}
                </span>
                <button 
                    onClick={() => handlePageChange(page + 1)} 
                    disabled={page === totalPages}
                    className="p-2 bg-white dark:bg-base-900 border border-base-300 dark:border-base-700 rounded-lg disabled:opacity-50 hover:bg-base-50 dark:hover:bg-base-800 transition"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="container mx-auto px-4 py-8 flex-grow">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left space-y-6 md:space-y-0 md:space-x-8 mb-12 animate-fade-in">
                    
                    <button 
                        onClick={() => setIsAvatarModalOpen(true)}
                        className="group relative w-40 h-40 rounded-full border-4 border-white dark:border-base-900 shadow-xl overflow-hidden flex-shrink-0 focus:outline-none focus:ring-4 focus:ring-primary/50"
                        aria-label="View profile photo"
                    >
                        <img 
                            src={user.avatar_url} 
                            alt={user.login} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Maximize2 className="text-white drop-shadow-md" size={24} />
                        </div>
                    </button>

                    <div className="flex-1">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{user.name || user.login}</h1>
                        <p className="text-xl text-gray-500 dark:text-base-400 mt-1">@{user.login}</p>
                        {user.bio && <p className="mt-4 text-gray-700 dark:text-base-300 max-w-xl mx-auto md:mx-0">{user.bio}</p>}

                        <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-3 text-sm text-gray-600 dark:text-base-400">
                            {user.company && <span className="flex items-center"><Building size={14} className="mr-1.5" /> {user.company}</span>}
                            {user.location && <span className="flex items-center"><MapPin size={14} className="mr-1.5" /> {user.location}</span>}
                            {user.blog && <a href={user.blog.startsWith('http') ? user.blog : `//${user.blog}`} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-primary transition-colors"><LinkIcon size={14} className="mr-1.5" /> {user.blog}</a>}
                        </div>

                        <div className="mt-6 flex justify-center md:justify-start space-x-6">
                            <span className="flex items-center text-sm">
                                <Users size={16} className="mr-2" />
                                <strong className="mr-1">{formatNumber(user.followers)}</strong> followers
                            </span>
                            <span className="flex items-center text-sm">
                                <strong className="mr-1">{formatNumber(user.following)}</strong> following
                            </span>
                        </div>

                        <a href={user.html_url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block px-6 py-2 bg-base-800 dark:bg-white text-white dark:text-base-900 rounded-lg font-semibold hover:opacity-90 transition shadow-sm">
                            View on GitHub
                        </a>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center border-b border-base-200 dark:border-base-800 mb-8 overflow-x-auto">
                    <button
                        onClick={() => handleTabChange('repos')}
                        className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'repos' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        <Book size={16} className="mr-2" />
                        Repositories
                        <span className="ml-2 bg-base-200 dark:bg-base-800 text-xs px-2 py-0.5 rounded-full">{formatNumber(user.public_repos)}</span>
                    </button>
                    <button
                        onClick={() => handleTabChange('gists')}
                        className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'gists' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        <FileCode size={16} className="mr-2" />
                        Gists
                        <span className="ml-2 bg-base-200 dark:bg-base-800 text-xs px-2 py-0.5 rounded-full">{formatNumber(user.public_gists)}</span>
                    </button>
                </div>

                {/* Content Header & Pagination */}
                <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold flex items-center">
                        {activeTab === 'repos' ? <LayoutGrid size={20} className="mr-2 text-gray-400" /> : <FileCode size={20} className="mr-2 text-gray-400" />}
                        {activeTab === 'repos' ? 'Repositories' : 'Gists'}
                    </h2>
                    {renderPagination()}
                </div>

                {/* Content Grid */}
                {contentLoading ? (
                     <div className="flex justify-center items-center py-20 w-full col-span-full">
                         <CustomLoader size={60} />
                     </div>
                ) : activeTab === 'repos' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {repos.map(repo => <RepoCard key={repo.id} repo={repo} />)}
                        {repos.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                No repositories found.
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {gists.map(gist => (
                            <GistCard key={gist.id} gist={gist} onClick={() => setSelectedGistId(gist.id)} />
                        ))}
                        {gists.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                No gists found.
                            </div>
                        )}
                    </div>
                )}
            </main>
            <Footer />

            {selectedGistId && (
                <GistViewerModal 
                    gistId={selectedGistId} 
                    onClose={() => setSelectedGistId(null)} 
                />
            )}

            {isAvatarModalOpen && (
                <div 
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setIsAvatarModalOpen(false)}
                >
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsAvatarModalOpen(false);
                        }}
                        className="absolute top-6 right-6 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors border border-white/10 z-[110]"
                        aria-label="Close preview"
                    >
                        <X size={24} />
                    </button>
                    
                    <div 
                        className="relative max-w-4xl w-full h-full flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img 
                            src={user.avatar_url} 
                            alt={user.login} 
                            className="max-w-full max-h-[90vh] w-auto h-auto rounded-xl shadow-2xl object-contain" 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
