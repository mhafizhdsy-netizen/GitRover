import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { githubApi } from '../services/githubApi';
import { Repo } from '../types';
import RepoCard from '../components/RepoCard';
import { Search, ChevronLeft, ChevronRight, ListFilter, ChevronDown } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ErrorDisplay from '../components/common/ErrorDisplay';
import { useSettings } from '../contexts/SettingsContext';

const SkeletonCard: React.FC = () => (
  <div className="bg-white dark:bg-base-900 p-5 rounded-2xl relative overflow-hidden shadow-sm border border-base-200 dark:border-base-800">
    <div className="space-y-3">
        <div className="h-5 bg-base-200 dark:bg-base-800 rounded-lg w-3/4"></div>
        <div className="space-y-2">
            <div className="h-3 bg-base-200 dark:bg-base-800 rounded-lg w-full"></div>
            <div className="h-3 bg-base-200 dark:bg-base-800 rounded-lg w-5/6"></div>
        </div>
        <div className="flex pt-2 space-x-4">
            <div className="h-4 bg-base-200 dark:bg-base-800 rounded-lg w-1/4"></div>
            <div className="h-4 bg-base-200 dark:bg-base-800 rounded-lg w-1/4"></div>
        </div>
    </div>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-base-100/50 dark:via-base-800/50 to-transparent"></div>
  </div>
);

export default function HomePage() {
  // Use setSearchParams to update the URL
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialQuery = searchParams.get('q') || 'react';
  // Initialize page from URL, default to 1 if missing
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  // Initialize sort from URL, default to 'best-match' (GitHub default)
  const initialSort = searchParams.get('sort') || 'best-match';
  
  const [query, setQuery] = useState(initialQuery);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  
  // Sync state with URL param
  const [page, setPage] = useState(initialPage);
  const [sort, setSort] = useState(initialSort);
  const [totalPages, setTotalPages] = useState(0);

  // Custom Dropdown State
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const fetchRepos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Pass the selected sort option. 'best-match' will be handled by the API service (omitted from params).
      const { data } = await githubApi.searchRepositories(searchTerm, sort, 'desc', page);
      setRepos(data.items);
      // Github API search limit is 1000 results. 12 per page = ~84 pages max.
      setTotalPages(Math.min(Math.ceil(data.total_count / 12), 84));
    } catch (err: any) {
      setError(err);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page, sort]);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
            setIsSortOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
        setPage(1);
        setSearchTerm(query);
        // Update URL with new query, reset page to 1, keep current sort
        setSearchParams({ q: query, page: '1', sort: sort });
    }
  };

  const handlePageChange = (newPage: number) => {
      setPage(newPage);
      // Update URL to reflect new page number and keep sort
      setSearchParams({ q: searchTerm, page: newPage.toString(), sort: sort });
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortSelect = (newSort: string) => {
      setSort(newSort);
      setPage(1); // Reset to first page on sort change
      setSearchParams({ q: searchTerm, page: '1', sort: newSort });
      setIsSortOpen(false);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    // Always show first page
    pages.push(1);

    // Calculate range around current page
    let start = Math.max(2, page - 1);
    let end = Math.min(totalPages - 1, page + 1);

    // Add ellipsis before range if needed
    if (start > 2) {
        pages.push('...');
    }

    // Add pages in range
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    // Add ellipsis after range if needed
    if (end < totalPages - 1) {
        pages.push('...');
    }

    // Always show last page
    if (totalPages > 1) {
        pages.push(totalPages);
    }

    return (
        <div className="flex items-center space-x-1.5 overflow-x-auto p-2">
             <button 
                onClick={() => handlePageChange(Math.max(1, page - 1))} 
                disabled={page === 1} 
                className="p-2 bg-white dark:bg-base-900 border border-base-300 dark:border-base-700 rounded-lg disabled:opacity-50 transition hover:bg-base-100 dark:hover:bg-base-800 disabled:hover:bg-white dark:disabled:hover:bg-base-900"
                aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>
            
            {pages.map((p, index) => (
                <React.Fragment key={index}>
                    {p === '...' ? (
                        <span className="px-2 text-gray-500">...</span>
                    ) : (
                        <button
                            onClick={() => handlePageChange(Number(p))}
                            className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg font-medium text-sm transition-colors border
                                ${page === p 
                                    ? 'bg-primary text-white border-primary shadow-sm' 
                                    : 'bg-white dark:bg-base-900 text-gray-700 dark:text-base-300 border-base-300 dark:border-base-700 hover:bg-base-100 dark:hover:bg-base-800'
                                }
                            `}
                        >
                            {p}
                        </button>
                    )}
                </React.Fragment>
            ))}

            <button 
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))} 
                disabled={page === totalPages} 
                className="p-2 bg-white dark:bg-base-900 border border-base-300 dark:border-base-700 rounded-lg disabled:opacity-50 transition hover:bg-base-100 dark:hover:bg-base-800 disabled:hover:bg-white dark:disabled:hover:bg-base-900"
                aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
        </div>
    );
  };
  
  const sortOptions = [
    { value: 'best-match', label: 'Best Match' },
    { value: 'stars', label: 'Most Stars' },
    { value: 'forks', label: 'Most Forks' },
    { value: 'updated', label: 'Recently Updated' },
  ];

  const currentSortLabel = sortOptions.find(o => o.value === sort)?.label || 'Best Match';

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8 max-w-xl mx-auto">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for repositories..."
                  className="w-full pl-12 pr-4 py-3 border border-base-300 dark:border-base-700 rounded-xl bg-white dark:bg-base-900 focus:ring-2 focus:ring-primary focus:outline-none transition text-gray-800 dark:text-gray-100"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </form>
            
            <div className="flex justify-end px-1 relative z-20" ref={sortRef}>
                <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center space-x-2 bg-white dark:bg-base-900 rounded-lg border border-base-300 dark:border-base-700 px-4 py-2 shadow-sm hover:border-primary/50 dark:hover:border-primary/50 transition-colors group"
                >
                    <ListFilter size={16} className="text-gray-500 group-hover:text-primary transition-colors" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-primary transition-colors">Sort: {currentSortLabel}</span>
                    <ChevronDown size={14} className={`text-gray-400 group-hover:text-primary transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
                </button>

                {isSortOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-base-900 rounded-xl shadow-xl border border-base-200 dark:border-base-800 py-2 animate-fade-in overflow-hidden">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Sort Repositories
                        </div>
                        {sortOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSortSelect(option.value)}
                                className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors
                                    ${sort === option.value 
                                        ? 'bg-base-50 dark:bg-base-800 text-primary font-medium' 
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-base-50 dark:hover:bg-base-800'
                                    }
                                `}
                            >
                                <span>{option.label}</span>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    sort === option.value 
                                    ? 'border-primary' 
                                    : 'border-base-300 dark:border-base-600'
                                }`}>
                                    {sort === option.value && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {error && (
           <ErrorDisplay error={error} onRetry={fetchRepos} />
        )}
        
        {!error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
                Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (
                repos.map((repo) => <RepoCard key={repo.id} repo={repo} />)
            )}
            </div>
        )}

        {!loading && !error && repos.length > 0 && (
          <div className="flex justify-center mt-12">
            {renderPagination()}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}