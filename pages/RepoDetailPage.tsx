import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { githubApi } from '../services/githubApi';
import { Repo, Contributor, Branch } from '../types';
import { Code, GitCommit, AlertCircle, GitPullRequest, Scale, FileText, PanelRightOpen, X } from 'lucide-react';
import RepoHeader from '../components/RepoHeader';
import { RepoSidebar } from '../components/RepoSidebar';
import FileExplorer from '../components/FileExplorer';
import CommitList from '../components/CommitList';
import IssueList from '../components/IssueList';
import PullRequestList from '../components/PullRequestList';
import MarkdownRenderer from '../components/MarkdownRenderer';
import LicenseViewer from '../components/LicenseViewer';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ErrorDisplay from '../components/common/ErrorDisplay';

const TABS = [
  { name: 'Code', icon: Code },
  { name: 'Commits', icon: GitCommit },
  { name: 'Issues', icon: AlertCircle },
  { name: 'Pull Requests', icon: GitPullRequest },
  { name: 'License', icon: Scale },
];

const SkeletonLoader: React.FC = () => (
    <div className="container mx-auto px-4 py-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="mb-8">
            <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-base-200 dark:bg-base-800 rounded-full mr-4"></div>
                <div className="flex flex-col gap-2 w-full max-w-md">
                    <div className="h-7 bg-base-200 dark:bg-base-800 rounded w-3/4"></div>
                    <div className="h-4 bg-base-200 dark:bg-base-800 rounded w-1/2"></div>
                </div>
            </div>
            <div className="h-4 bg-base-200 dark:bg-base-800 rounded w-full max-w-2xl mb-6"></div>
            <div className="flex space-x-6">
                <div className="h-5 bg-base-200 dark:bg-base-800 rounded w-20"></div>
                <div className="h-5 bg-base-200 dark:bg-base-800 rounded w-20"></div>
                <div className="h-5 bg-base-200 dark:bg-base-800 rounded w-20"></div>
            </div>
        </div>
        
        <div className="lg:flex lg:space-x-8 mt-10">
            <main className="lg:w-[calc(100%-22rem)] flex-1">
                {/* Tabs Skeleton */}
                <div className="flex border-b border-base-200 dark:border-base-800 mb-6 gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-10 w-24 bg-base-200 dark:bg-base-800 rounded-t-lg mx-1 mb-[-1px]"></div>
                    ))}
                </div>
                
                {/* File Explorer Skeleton */}
                <div className="border border-base-200 dark:border-base-800 rounded-lg overflow-hidden mb-6">
                    <div className="p-3 bg-base-50 dark:bg-base-900 border-b border-base-200 dark:border-base-800 flex justify-between items-center h-12">
                         <div className="h-6 w-32 bg-base-200 dark:bg-base-800 rounded"></div>
                         <div className="h-6 w-48 bg-base-200 dark:bg-base-800 rounded hidden sm:block"></div>
                    </div>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="p-3 border-b border-base-200 dark:border-base-800 last:border-0 flex items-center justify-between">
                            <div className="flex items-center space-x-3 w-full">
                                <div className="w-5 h-5 bg-base-200 dark:bg-base-800 rounded flex-shrink-0"></div>
                                <div className="h-4 bg-base-200 dark:bg-base-800 rounded w-1/3"></div>
                            </div>
                            <div className="h-3 bg-base-200 dark:bg-base-800 rounded w-16 hidden md:block"></div>
                        </div>
                    ))}
                </div>

                 {/* README Skeleton */}
                 <div className="border border-base-200 dark:border-base-800 rounded-lg overflow-hidden">
                     <div className="p-3 bg-base-50 dark:bg-base-900 border-b border-base-200 dark:border-base-800 h-10 w-full"></div>
                     <div className="p-6 space-y-4">
                        <div className="h-6 bg-base-200 dark:bg-base-800 rounded w-3/4 mb-6"></div>
                        <div className="h-4 bg-base-200 dark:bg-base-800 rounded w-full"></div>
                        <div className="h-4 bg-base-200 dark:bg-base-800 rounded w-full"></div>
                        <div className="h-4 bg-base-200 dark:bg-base-800 rounded w-5/6"></div>
                        <div className="h-4 bg-base-200 dark:bg-base-800 rounded w-full mt-4"></div>
                     </div>
                 </div>
            </main>
            
            <aside className="hidden lg:block lg:w-80 space-y-6">
                {/* AI Sidebar Skeleton */}
                <div className="h-40 bg-base-200 dark:bg-base-800 rounded-xl"></div>
                {/* About Skeleton */}
                <div className="space-y-3">
                    <div className="h-4 w-16 bg-base-200 dark:bg-base-800 rounded"></div>
                    <div className="h-4 w-full bg-base-200 dark:bg-base-800 rounded"></div>
                    <div className="h-4 w-5/6 bg-base-200 dark:bg-base-800 rounded"></div>
                </div>
                {/* Languages Skeleton */}
                <div>
                     <div className="h-4 w-24 bg-base-200 dark:bg-base-800 rounded mb-3"></div>
                     <div className="h-3 w-full bg-base-200 dark:bg-base-800 rounded-full mb-2"></div>
                     <div className="flex gap-2">
                        <div className="h-3 w-12 bg-base-200 dark:bg-base-800 rounded"></div>
                        <div className="h-3 w-12 bg-base-200 dark:bg-base-800 rounded"></div>
                     </div>
                </div>
            </aside>
        </div>
    </div>
);

export default function RepoDetailPage() {
  const { owner, name, '*': splat } = useParams<{ owner:string; name: string; '*': string }>();
  
  const [repo, setRepo] = useState<Repo | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [languages, setLanguages] = useState<Record<string, number> | null>(null);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [readmeContent, setReadmeContent] = useState<string | null>(null);
  const [readmePath, setReadmePath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  
  const [activeTab, setActiveTab] = useState('Code');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const pathSegments = splat?.split('/').filter(Boolean) ?? [];
  const viewType = pathSegments[0] === 'blob' ? 'blob' : 'tree';
  
  const currentBranchFromUrl = (viewType === 'blob' || viewType === 'tree') ? pathSegments[1] : undefined;
  const branch = currentBranchFromUrl || repo?.default_branch || 'main';
  
  const contentPath = pathSegments.slice(2).join('/');
  const currentPath = viewType === 'tree' ? contentPath : (viewType === 'blob' ? contentPath.split('/').slice(0, -1).join('/') : '');

  const safeBase64Decode = (str: string) => {
    try {
        return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    } catch (e) {
        console.warn("Failed to decode README content", e);
        return null;
    }
  };

  const fetchRepoData = useCallback(async () => {
    if (!owner || !name) return;
    setLoading(true);
    setIsContentLoaded(false);
    setError(null);
    
    try {
      const repoRes = await githubApi.getRepository(owner, name);
      const newRepo = repoRes.data;
      setRepo(newRepo);

      let effectiveBranch = newRepo.default_branch;
      if (splat) {
        const parts = splat.split('/').filter(Boolean);
        if (parts.length >= 2 && (parts[0] === 'tree' || parts[0] === 'blob')) {
            effectiveBranch = parts[1];
        }
      }

      const [langRes, contribRes, readmeRes, branchesRes] = await Promise.all([
        githubApi.getLanguages(owner, name),
        githubApi.getContributors(owner, name),
        githubApi.getReadme(owner, name, effectiveBranch).catch(() => null),
        githubApi.getBranches(owner, name).catch(() => null),
      ]);
      
      setLanguages(langRes.data);
      setContributors(contribRes.data);
      
      if (readmeRes && readmeRes.data.content) {
        const decodedContent = safeBase64Decode(readmeRes.data.content);
        setReadmeContent(decodedContent);
        setReadmePath(readmeRes.data.path);
      } else {
        setReadmeContent(null);
        setReadmePath(null);
      }
      if (branchesRes) {
        setBranches(branchesRes.data);
      }
    } catch (err: any) {
      setError(err);
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setIsContentLoaded(true), 100);
    }
  }, [owner, name, splat]);

  useEffect(() => {
    fetchRepoData();
  }, [owner, name]);

  if (loading) {
    return <div className="flex flex-col min-h-screen"><Header /><SkeletonLoader /><Footer /></div>;
  }

  if (error || !repo) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex items-center justify-center">
            <ErrorDisplay error={error} onRetry={fetchRepoData} fullScreen />
        </div>
        <Footer />
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Code':
        return (
          <>
            <FileExplorer owner={owner!} name={name!} path={currentPath} branch={branch} branches={branches} />
            {readmeContent && readmePath && !currentPath && (
              <div className="mt-8 border border-base-200 dark:border-base-800 rounded-xl">
                <div className="px-5 py-3 bg-base-100 dark:bg-base-900 border-b border-base-200 dark:border-base-800 rounded-t-xl flex items-center">
                  <FileText size={16} className="mr-2 text-gray-500" />
                  <span className="font-semibold">README.md</span>
                </div>
                <div className="p-5 md:p-8">
                  <MarkdownRenderer 
                    content={readmeContent}
                    owner={owner!}
                    repoName={name!}
                    branch={branch}
                    filePath={readmePath}
                  />
                </div>
              </div>
            )}
          </>
        );
      case 'Commits':
        return <CommitList owner={owner!} repo={name!} />;
      case 'Issues':
        return <IssueList owner={owner!} repo={name!} />;
      case 'Pull Requests':
        return <PullRequestList owner={owner!} repo={name!} />;
      case 'License':
        return <LicenseViewer owner={owner!} repo={name!} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className={`container mx-auto px-4 py-8 transition-opacity duration-300 flex-grow ${isContentLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <RepoHeader repo={repo} />
        
        <div className="lg:flex lg:space-x-8 mt-6 lg:mt-10">
          <main className="lg:w-[calc(100%-22rem)] flex-1">
            <div className="flex justify-between items-center border-b border-base-200 dark:border-base-800 mb-6">
              <nav className="flex space-x-2 overflow-x-auto" aria-label="Tabs">
                {TABS.map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`flex items-center whitespace-nowrap py-2.5 px-4 font-medium text-sm transition-colors rounded-t-lg
                      ${activeTab === tab.name
                        ? 'bg-base-100 dark:bg-base-900 text-primary'
                        : 'text-gray-500 hover:text-gray-800 dark:text-base-400 dark:hover:text-white'
                      }`}
                  >
                    <tab.icon size={16} className="mr-2" />
                    {tab.name}
                  </button>
                ))}
              </nav>
              <div className="lg:hidden pb-2 pl-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 rounded-lg text-gray-500 dark:text-base-400 hover:bg-base-100 dark:hover:bg-base-800"
                  aria-label="Show repository details"
                >
                  <PanelRightOpen size={20} />
                </button>
              </div>
            </div>
            {renderTabContent()}
          </main>
          <aside className="hidden lg:block lg:w-80">
            <div className="sticky top-24">
              <RepoSidebar repo={repo} languages={languages} contributors={contributors} readmeContent={readmeContent} />
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'visible bg-black/60' : 'invisible'}`}
        onClick={() => setIsSidebarOpen(false)}
        role="dialog"
        aria-modal="true"
      >
        <div
          className={`absolute right-0 top-0 h-full w-full max-w-sm bg-base-50 dark:bg-base-950 shadow-2xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 overflow-y-auto h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-semibold text-lg">Details</h2>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 -mr-2 rounded-full hover:bg-base-100 dark:hover:bg-base-800"
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            </div>
            <RepoSidebar repo={repo} languages={languages} contributors={contributors} readmeContent={readmeContent} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}