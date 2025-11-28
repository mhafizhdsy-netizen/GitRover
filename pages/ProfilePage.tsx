
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { githubApi } from '../services/githubApi';
import { UserProfile, Repo, Gist, Organization } from '../types';
import { Users, MapPin, Link as LinkIcon, Building, ChevronLeft, ChevronRight, Book, FileCode, LayoutGrid, X, Maximize2, Calendar, Mail, Twitter, BookCopy } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import RepoCard from '../components/RepoCard';
import GistCard from '../components/GistCard';
import ErrorDisplay from '../components/common/ErrorDisplay';
import { formatNumber } from '../utils/formatters';
import GistViewerModal from '../components/GistViewerModal';
import CustomLoader from '../components/common/CustomLoader';
import SEO from '../components/common/SEO';
import { ThemeContext } from '../contexts/ThemeContext';
import LanguageBar from '../components/common/LanguageBar';
import { createProfileSchema } from '../utils/structuredData';


const ProfilePage: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const themeContext = useContext(ThemeContext);

    const [user, setUser] = useState<UserProfile | null>(null);
    const [repos, setRepos] = useState<Repo[]>([]);
    const [gists, setGists] = useState<Gist[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [topLanguages, setTopLanguages] = useState<Record<string, number> | null>(null);
    
    const [loading, setLoading] = useState(true);
    const [contentLoading, setContentLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    
    const [selectedGistId, setSelectedGistId] = useState<string | null>(null);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const tabParam = searchParams.get('tab');
    const activeTab = (tabParam === 'gists' ? 'gists' : 'repos') as 'repos' | 'gists';
    const [totalPages, setTotalPages] = useState(1);
    const mode = themeContext?.mode || 'light';

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
        if (!user || !username) return;

        const fetchSecondaryData = async () => {
            setStatsLoading(true);
            try {
                // Fetch orgs
                const orgsPromise = githubApi.getUserOrgs(username).then(res => setOrganizations(res.data)).catch(() => {});

                // Calculate languages
                const langPromise = (async () => {
                    const reposRes = await githubApi.getUserRepos(username, 1, 30);
                    const langPromises = reposRes.data.map(repo => 
                        githubApi.getLanguages(repo.owner.login, repo.name)
                            .then(res => res.data)
                            .catch(() => ({}))
                    );
                    const languagesPerRepo = await Promise.all(langPromises);
                    const aggregated: Record<string, number> = {};
                    languagesPerRepo.forEach(repoLangs => {
                        for (const [lang, bytes] of Object.entries(repoLangs)) {
                            // FIX: Cast `bytes` to number. Object.entries on a complex type can result in `unknown`.
                            aggregated[lang] = (aggregated[lang] || 0) + (bytes as number);
                        }
                    });
                    setTopLanguages(aggregated);
                })();

                await Promise.all([orgsPromise, langPromise]);
            } catch (err) {
                console.error("Failed to fetch secondary profile data", err);
            } finally {
                setStatsLoading(false);
            }
        };

        fetchSecondaryData();
    }, [user, username]);

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
                    const res = await githubApi.getUserRepos(username, page, 12);
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

    const joinedDate = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const profileSchema = createProfileSchema(user);

    return (
        <div className="flex flex-col min-h-screen">
            <SEO 
                title={`${user.name || user.login} - GitRover`} 
                description={`View ${user.login}'s profile, repositories, and gists on GitRover.`}
                schema={profileSchema}
            />
            <Header />
            <main className="container mx-auto px-4 py-8 flex-grow">
                <div className="md:grid md:grid-cols-12 md:gap-8">
                    {/* --- Left Sidebar --- */}
                    <aside className="md:col-span-4 lg:col-span-3 animate-fade-in">
                        <div className="p-1 bg-gradient-to-br from-primary to-secondary rounded-full w-40 h-40 mx-auto md:mx-0 shadow-lg -mt-16 md:-mt-24 relative z-10">
                             <button 
                                onClick={() => setIsAvatarModalOpen(true)}
                                className="group w-full h-full rounded-full bg-white dark:bg-base-900 p-1 overflow-hidden"
                            >
                                <img 
                                    src={user.avatar_url} 
                                    alt={user.login} 
                                    className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-110" 
                                />
                             </button>
                        </div>

                        <div className="mt-4 text-center md:text-left">
                             <div className="flex flex-col md:flex-row items-center md:items-baseline gap-2 justify-center md:justify-start">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name || user.login}</h1>
                                {user.type === 'Organization' && (
                                    <span className="px-2 py-0.5 rounded-full bg-base-200 dark:bg-base-800 text-gray-600 dark:text-base-400 text-xs font-bold border border-base-300 dark:border-base-700">
                                        Org
                                    </span>
                                )}
                            </div>
                            <p className="text-lg text-gray-500 dark:text-base-400">@{user.login}</p>
                        </div>
                        
                        <a href={user.html_url} target="_blank" rel="noopener noreferrer" className="mt-4 w-full text-center block px-4 py-2 bg-base-100 dark:bg-base-800 border border-base-200 dark:border-base-700 rounded-lg font-semibold hover:bg-base-200 dark:hover:bg-base-700 transition shadow-sm">
                            View on GitHub
                        </a>

                        {user.bio && <p className="mt-6 text-sm text-gray-700 dark:text-base-300">{user.bio}</p>}

                        <div className="mt-6 flex items-center justify-center md:justify-start gap-x-6 gap-y-2 text-sm">
                            <span className="flex items-center gap-1.5"><Users size={14} /> <strong>{formatNumber(user.followers)}</strong> followers</span>
                            <span>·</span>
                            <span className="flex items-center gap-1.5"><strong>{formatNumber(user.following)}</strong> following</span>
                        </div>

                        <div className="mt-6 space-y-3 text-sm text-gray-600 dark:text-base-400">
                            {user.company && <span className="flex items-center gap-2"><Building size={14} /> {user.company}</span>}
                            {user.location && <span className="flex items-center gap-2"><MapPin size={14} /> {user.location}</span>}
                            {user.email && <a href={`mailto:${user.email}`} className="flex items-center gap-2 hover:text-primary transition-colors"><Mail size={14} /> {user.email}</a>}
                            {user.blog && <a href={user.blog.startsWith('http') ? user.blog : `//${user.blog}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors truncate"><LinkIcon size={14} /> <span className="truncate">{user.blog}</span></a>}
                            {user.twitter_username && <a href={`https://twitter.com/${user.twitter_username}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors"><Twitter size={14} /> @{user.twitter_username}</a>}
                            <span className="flex items-center gap-2"><Calendar size={14} /> Joined {joinedDate}</span>
                        </div>
                        
                        {user.hireable && (
                            <div className="mt-6 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 text-sm font-medium text-green-700 dark:text-green-300">
                                Available for hire
                            </div>
                        )}
                        
                        <div className="mt-8">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Organizations</h3>
                             {statsLoading ? (
                                <div className="flex flex-wrap gap-2">{Array.from({length: 3}).map((_, i) => <div key={i} className="w-8 h-8 rounded-full bg-base-200 dark:bg-base-800 animate-pulse"></div>)}</div>
                             ) : organizations.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                {organizations.map(org => (
                                    <Link key={org.id} to={`/profile/${org.login}`} title={org.login} className="hover:opacity-80 transition">
                                        <img src={org.avatar_url} alt={org.login} className="w-8 h-8 rounded-full border-2 border-white dark:border-base-900 bg-base-200" />
                                    </Link>
                                ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500">Not a member of any public organizations.</p>
                            )}
                        </div>

                        <div className="mt-8">
                             <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">Top Languages</h3>
                             {statsLoading ? (
                                <div className="space-y-2">{Array.from({length: 4}).map((_, i) => <div key={i} className="w-full h-3 rounded bg-base-200 dark:bg-base-800 animate-pulse"></div>)}</div>
                             ) : topLanguages && Object.keys(topLanguages).length > 0 ? (
                                <LanguageBar languages={topLanguages} />
                             ) : (
                                <p className="text-xs text-gray-500">Not enough data to display top languages.</p>
                             )}
                        </div>
                    </aside>

                    {/* --- Main Content --- */}
                    <div className="md:col-span-8 lg:col-span-9 mt-8 md:mt-0 animate-fade-in">
                        <div className="mb-8">
                             <img 
                                src={`https://ghchart.rshah.org/${username}?theme=${mode}`} 
                                alt={`${username}'s Contribution Graph`} 
                                className="w-full rounded-lg border border-base-200 dark:border-base-800 p-2 bg-white dark:bg-base-900" 
                             />
                        </div>
                        
                        <div className="flex items-center border-b border-base-200 dark:border-base-800 overflow-x-auto">
                            <button
                                onClick={() => handleTabChange('repos')}
                                className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'repos' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                            >
                                <BookCopy size={16} className="mr-2" />
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
                        
                        <div className="flex flex-wrap justify-end items-center my-6 gap-4">
                            {renderPagination()}
                        </div>
                        
                        {contentLoading ? (
                            <div className="flex justify-center items-center py-20 w-full col-span-full">
                                <CustomLoader size={60} />
                            </div>
                        ) : activeTab === 'repos' ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {repos.map(repo => <RepoCard key={repo.id} repo={repo} />)}
                                {repos.length === 0 && (
                                    <div className="col-span-full text-center py-12 text-gray-500">
                                        No repositories found.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        className="relative flex items-center justify-center pointer-events-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img 
                            src={user.avatar_url} 
                            alt={user.login} 
                            className="max-w-full max-h-[85dvh] w-auto h-auto rounded-xl shadow-2xl object-contain pointer-events-auto" 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;