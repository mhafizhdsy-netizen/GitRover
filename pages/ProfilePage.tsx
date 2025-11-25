import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { githubApi } from '../services/githubApi';
import { UserProfile, Repo } from '../types';
import { Loader2, Users, MapPin, Link as LinkIcon, Building, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import RepoCard from '../components/RepoCard';
import ErrorDisplay from '../components/common/ErrorDisplay';
import { formatNumber } from '../utils/formatters';

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
    const [loading, setLoading] = useState(true);
    const [reposLoading, setReposLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const initialPage = parseInt(searchParams.get('page') || '1', 10);
    const [page, setPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(1);

    const fetchProfile = useCallback(() => {
        if (!username) return;
        setLoading(true);
        setError(null);
        setPage(1);
        setSearchParams({ page: '1' }, { replace: true });

        githubApi.getUserProfile(username)
            .then(response => {
                setUser(response.data);
                const maxPages = response.data.public_repos > 0 ? Math.ceil(response.data.public_repos / 12) : 1;
                setTotalPages(maxPages);
            })
            .catch(err => {
                setError(err);
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, [username, setSearchParams]);

    const fetchRepos = useCallback(() => {
        if (!username) return;

        setReposLoading(true);
        githubApi.getUserRepos(username, page)
            .then(response => {
                setRepos(response.data);
            })
            .catch(err => {
                // Don't set a page-level error for repo fetch failure, but log it
                console.error("Failed to fetch user repositories:", err);
                setRepos([]); // Clear repos on error
            })
            .finally(() => setReposLoading(false));
    }, [username, page]);


    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        if(user) { // Only fetch repos after user profile is loaded
            fetchRepos();
        }
    }, [user, fetchRepos]);

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= totalPages) {
            setPage(newPage);
            setSearchParams({ page: newPage.toString() });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    
    if (loading) {
        return <div className="flex flex-col min-h-screen"><Header /><ProfilePageSkeleton /><Footer /></div>;
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
                    className="p-2 bg-white dark:bg-base-900 border border-base-300 dark:border-base-700 rounded-lg disabled:opacity-50"
                    aria-label="Previous page"
                >
                    <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-medium px-2">
                    Page {page} of {totalPages}
                </span>
                <button 
                    onClick={() => handlePageChange(page + 1)} 
                    disabled={page === totalPages}
                    className="p-2 bg-white dark:bg-base-900 border border-base-300 dark:border-base-700 rounded-lg disabled:opacity-50"
                    aria-label="Next page"
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
                <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left space-y-6 md:space-y-0 md:space-x-8 mb-12">
                    <img src={user.avatar_url} alt={user.login} className="w-40 h-40 rounded-full border-4 border-white dark:border-base-900 shadow-xl" />
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

                        <a href={user.html_url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block px-6 py-2 bg-base-800 text-white rounded-lg font-semibold hover:bg-black transition">
                            View on GitHub
                        </a>
                    </div>
                </div>

                <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold">Public Repositories ({formatNumber(user.public_repos)})</h2>
                    {renderPagination()}
                </div>

                {reposLoading ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                         {Array.from({ length: 6 }).map((_, i) => (
                             <div key={i} className="bg-white dark:bg-base-900 p-5 rounded-2xl h-48 border border-base-200 dark:border-base-800"></div>
                         ))}
                     </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {repos.map(repo => <RepoCard key={repo.id} repo={repo} />)}
                    </div>
                )}
                
                {!reposLoading && repos.length === 0 && user.public_repos > 0 && (
                     <div className="text-center py-12 text-gray-500">
                         Loading repositories...
                     </div>
                )}
                
                {!reposLoading && user.public_repos === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        {user.login} doesn’t have any public repositories yet.
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default ProfilePage;
