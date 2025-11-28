
import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertTriangle, GitPullRequest } from 'lucide-react';
import { aiService, PRContext } from '../services/aiService';
import { githubApi } from '../services/githubApi';
import MarkdownRenderer from './MarkdownRenderer';
import CustomLoader from './common/CustomLoader';
import { PullRequest } from '../types';

interface AIPrReviewModalProps {
  pr: PullRequest;
  owner: string;
  repo: string;
  onClose: () => void;
}

const AIPrReviewModal: React.FC<AIPrReviewModalProps> = ({ pr, owner, repo, onClose }) => {
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const generateReview = async () => {
        try {
            // 1. Fetch file context to make the review smarter
            const filesRes = await githubApi.getPullRequestFiles(owner, repo, pr.number);
            const files = filesRes.data;

            const context: PRContext = {
                title: pr.title,
                body: pr.body || '',
                user: pr.user.login,
                files: files.map(f => ({
                    filename: f.filename,
                    status: f.status,
                    additions: f.additions,
                    deletions: f.deletions
                }))
            };

            // 2. Call AI
            const result = await aiService.reviewPullRequest(context);
            setReview(result);
        } catch (err: any) {
            setError(err.message || 'Failed to generate review.');
        } finally {
            setLoading(false);
        }
    };
    generateReview();
  }, [pr, owner, repo]);

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white dark:bg-base-900 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden border border-base-200 dark:border-base-800" 
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-5 border-b border-base-200 dark:border-base-800 flex-shrink-0 bg-base-50 dark:bg-base-950">
          <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg text-white shadow-md">
                 <GitPullRequest size={20} />
              </div>
              <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    AI PR Reviewer
                    <span className="text-[10px] bg-base-200 dark:bg-base-800 px-2 py-0.5 rounded-full font-mono text-gray-500">#{pr.number}</span>
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-base-400">Powered by Gemini 3.0</p>
              </div>
          </div>
          <button onClick={onClose} className="p-2 -m-2 rounded-full hover:bg-base-200 dark:hover:bg-base-800 transition text-gray-500 dark:text-gray-400">
            <X size={20} />
          </button>
        </header>
        
        <div className="p-6 overflow-y-auto bg-base-50/50 dark:bg-base-950/50 flex-1">
          <div>
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <CustomLoader size={56} />
                <p className="text-sm font-medium text-primary animate-pulse">Analyzing PR context and file changes...</p>
              </div>
            )}
            
            {error && (
              <div className="flex items-start text-red-500 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                <AlertTriangle size={20} className="mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            {review && (
                <div className="animate-fade-in">
                    <div className="prose-sm dark:prose-invert">
                        <MarkdownRenderer content={review} />
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPrReviewModal;
