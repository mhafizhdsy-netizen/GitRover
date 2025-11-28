
import React, { useState, useEffect, useCallback } from 'react';
import { githubApi } from '../services/githubApi';
import { Release } from '../types';
import { Tag, Package, ChevronDown, ChevronRight, FileArchive, ArrowLeftRight, Calendar, ServerCrash, Download, Box } from 'lucide-react';
import { formatRelativeTime, formatFileSize } from '../utils/formatters';
import MarkdownRenderer from './MarkdownRenderer';
import CompareModal from './CompareModal';
import CustomLoader from './common/CustomLoader';

interface ReleaseListProps {
  owner: string;
  repo: string;
}

const ReleaseItem: React.FC<{ 
  release: Release; 
  owner: string; 
  repo: string; 
  previousTag?: string; 
  onCompare: (base: string, head: string) => void;
}> = ({ release, owner, repo, previousTag, onCompare }) => {
    const [isAssetsOpen, setIsAssetsOpen] = useState(false);
    const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/tags/${release.tag_name}.zip`;
    const tarUrl = `https://github.com/${owner}/${repo}/archive/refs/tags/${release.tag_name}.tar.gz`;
    const isLatest = !release.prerelease && !release.draft;
    const borderColor = isLatest ? 'border-green-500' : (release.prerelease ? 'border-yellow-500' : 'border-gray-300 dark:border-gray-600');
    const badgeColor = isLatest ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : (release.prerelease ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300');
    const statusText = isLatest ? 'Latest' : (release.prerelease ? 'Pre-release' : 'Draft');

    return (
        <div className={`bg-white dark:bg-base-900 rounded-xl shadow-sm border border-base-200 dark:border-base-800 border-t-4 ${borderColor} overflow-hidden mb-8 transition-all duration-300 hover:shadow-lg`}>
            <div className="p-5 border-b border-base-100 dark:border-base-800/50">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-4">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                             <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white hover:text-primary transition-colors break-words">
                                 <a href={release.html_url} target="_blank" rel="noopener noreferrer">{release.name || release.tag_name}</a>
                             </h3>
                             <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide flex-shrink-0 ${badgeColor}`}>
                                 {statusText}
                             </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                             <div className="flex items-center gap-2">
                                <img src={release.author.avatar_url} alt={release.author.login} className="w-5 h-5 rounded-full border border-base-200 dark:border-base-700" />
                                <span className="font-medium text-gray-700 dark:text-gray-300">{release.author.login}</span>
                             </div>
                             <span className="hidden sm:inline text-gray-300">•</span>
                             <span className="flex items-center gap-1.5 font-mono text-xs">
                                 <Tag size={12} /> {release.tag_name}
                             </span>
                             <span className="hidden sm:inline text-gray-300">•</span>
                             <span className="flex items-center gap-1.5" title={new Date(release.published_at).toLocaleString()}>
                                 <Calendar size={12} /> {formatRelativeTime(release.published_at)}
                             </span>
                        </div>
                    </div>
                    
                    <div className="flex-shrink-0 pt-1">
                        {previousTag && (
                            <button onClick={() => onCompare(previousTag, release.tag_name)} className="p-2 text-gray-400 hover:text-primary hover:bg-base-100 dark:hover:bg-base-800 rounded-md transition-all" title="Compare changes">
                                <ArrowLeftRight size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6 prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-base-300 overflow-hidden">
                 <MarkdownRenderer content={release.body || '*No description provided.*'} owner={owner} repoName={repo} />
            </div>

            <div className="bg-base-50 dark:bg-base-950/30 border-t border-base-200 dark:border-base-800">
                 <button onClick={() => setIsAssetsOpen(!isAssetsOpen)} className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-base-100 dark:hover:bg-base-800 transition-colors">
                    <div className="flex items-center gap-2">
                        <Package size={16} />
                        <span>Assets</span>
                        <span className="bg-base-200 dark:bg-base-800 text-xs px-2 py-0.5 rounded-full text-gray-500">
                            {release.assets.length + 2}
                        </span>
                    </div>
                    {isAssetsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                 </button>
            </div>

            {isAssetsOpen && (
                 <div className="border-t border-base-200 dark:border-base-800 bg-white dark:bg-base-900 animate-fade-in">
                     <ul className="divide-y divide-base-100 dark:divide-base-800">
                        {release.assets.map(asset => (
                             <li key={asset.id} className="group">
                                 <a href={asset.browser_download_url} className="flex items-center justify-between px-6 py-3 hover:bg-base-50 dark:hover:bg-base-950 transition-colors">
                                     <div className="flex items-center gap-3 min-w-0 pr-4">
                                        <Box size={16} className="text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                                        <span className="font-medium text-sm text-blue-600 dark:text-blue-400 group-hover:underline truncate">{asset.name}</span>
                                     </div>
                                     <div className="flex items-center gap-6 flex-shrink-0">
                                         <span className="text-xs text-gray-500 font-mono">{formatFileSize(asset.size)}</span>
                                         <span className="hidden sm:flex p-1.5 rounded-md bg-base-100 dark:bg-base-800 text-gray-500 group-hover:text-primary"><Download size={14} /></span>
                                     </div>
                                 </a>
                             </li>
                        ))}
                        <li className="group">
                             <a href={zipUrl} className="flex items-center justify-between px-6 py-3 hover:bg-base-50 dark:hover:bg-base-950 transition-colors">
                                 <div className="flex items-center gap-3 min-w-0 pr-4">
                                    <FileArchive size={16} className="text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                                    <span className="font-medium text-sm text-blue-600 dark:text-blue-400 group-hover:underline">Source code (zip)</span>
                                 </div>
                                 <div className="flex items-center gap-6 flex-shrink-0">
                                     <span className="hidden sm:flex p-1.5 rounded-md bg-base-100 dark:bg-base-800 text-gray-500 group-hover:text-primary"><Download size={14} /></span>
                                 </div>
                             </a>
                        </li>
                        <li className="group">
                             <a href={tarUrl} className="flex items-center justify-between px-6 py-3 hover:bg-base-50 dark:hover:bg-base-950 transition-colors">
                                 <div className="flex items-center gap-3 min-w-0 pr-4">
                                    <FileArchive size={16} className="text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                                    <span className="font-medium text-sm text-blue-600 dark:text-blue-400 group-hover:underline">Source code (tar.gz)</span>
                                 </div>
                                 <div className="flex items-center gap-6 flex-shrink-0">
                                     <span className="hidden sm:flex p-1.5 rounded-md bg-base-100 dark:bg-base-800 text-gray-500 group-hover:text-primary"><Download size={14} /></span>
                                 </div>
                             </a>
                        </li>
                     </ul>
                 </div>
            )}
        </div>
    );
};

const ReleaseList: React.FC<ReleaseListProps> = ({ owner, repo }) => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [compareModal, setCompareModal] = useState<{ isOpen: boolean; base: string; head: string } | null>(null);

  const fetchReleases = useCallback(() => {
    setLoading(true);
    githubApi.getReleases(owner, repo, page)
      .then(response => {
        setReleases(prev => page === 1 ? response.data : [...prev, ...response.data]);
        if (response.data.length < 10) setHasMore(false);
      })
      .catch((err) => {
        if (err.response?.status === 404) setHasMore(false);
        else setError('Failed to fetch releases.');
      })
      .finally(() => setLoading(false));
  }, [owner, repo, page]);

  useEffect(() => {
    fetchReleases();
  }, [fetchReleases]);

  const handleCompare = (base: string, head: string) => setCompareModal({ isOpen: true, base, head });
  const closeCompare = () => setCompareModal(null);

  if (error) {
    return <div className="text-center py-10 text-red-500 flex flex-col items-center"><ServerCrash size={48} className="mb-4" /><p>{error}</p></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {releases.map((release, index) => {
        const previousRelease = releases[index + 1];
        const previousTag = previousRelease?.tag_name;
        return <ReleaseItem key={release.id} release={release} owner={owner} repo={repo} previousTag={previousTag} onCompare={handleCompare} />;
      })}

      {loading && <div className="flex justify-center py-8"><CustomLoader size={48} /></div>}

      {hasMore && !loading && releases.length > 0 && (
        <div className="text-center pt-4">
          <button onClick={() => setPage(p => p + 1)} className="px-6 py-2.5 text-sm border border-base-300 dark:border-base-700 rounded-lg hover:bg-base-100 dark:hover:bg-base-800 transition font-bold shadow-sm">
            Load more releases
          </button>
        </div>
      )}

      {!loading && releases.length === 0 && !error && (
        <div className="text-center py-16 px-4 bg-white dark:bg-base-900 rounded-xl border border-base-200 dark:border-base-800 border-dashed">
            <Tag size={40} className="mx-auto text-gray-300 dark:text-base-700 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No releases found</h3>
            <p className="text-gray-500 dark:text-base-400 mt-2">This repository hasn't published any releases yet.</p>
        </div>
      )}

      {compareModal && compareModal.isOpen && (
          <CompareModal owner={owner} repo={repo} base={compareModal.base} head={compareModal.head} releases={releases} onClose={closeCompare} />
      )}
    </div>
  );
};

export default ReleaseList;
