
import React, { useState } from 'react';
import { aiService } from '../services/aiService';
import { Sparkles, Activity, Loader2, BookOpen, ChevronRight, ChevronDown, AlertTriangle } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { Repo } from '../types';

interface AISidebarFeaturesProps {
    repo: Repo;
    readmeContent: string | null;
}

const SummarySkeleton: React.FC = () => (
    <div className="space-y-2 animate-pulse mt-3">
        <div className="h-3.5 bg-base-200 dark:bg-base-800 rounded-lg w-full"></div>
        <div className="h-3.5 bg-base-200 dark:bg-base-800 rounded-lg w-full"></div>
        <div className="h-3.5 bg-base-200 dark:bg-base-800 rounded-lg w-5/6"></div>
    </div>
);

const AISidebarFeatures: React.FC<AISidebarFeaturesProps> = ({ repo, readmeContent }) => {
    // Summary States
    const [summary, setSummary] = useState<string | null>(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);

    // Health Check States
    const [healthCheckResult, setHealthCheckResult] = useState<string | null>(null);
    const [isHealthCheckLoading, setIsHealthCheckLoading] = useState(false);
    const [healthCheckError, setHealthCheckError] = useState<string | null>(null);

    const handleGenerateSummary = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!isSummaryOpen) {
            setIsSummaryOpen(true);
            
            // Allow summary generation even if README is missing, as long as we have description or repo name
            if (!readmeContent && !repo.description) {
                setSummaryError("Not enough information (README or Description) to generate a summary.");
                return;
            }

            if (!summary && !isSummaryLoading) {
                setIsSummaryLoading(true);
                setSummaryError(null);
                
                aiService.summarizeRepo({
                    name: repo.name,
                    description: repo.description || '',
                    topics: repo.topics || [],
                    primaryLanguage: repo.language || '',
                    readme: readmeContent
                })
                .then(setSummary)
                .catch(err => setSummaryError(err.message || "Failed to generate summary."))
                .finally(() => setIsSummaryLoading(false));
            }
        } else {
            setIsSummaryOpen(false);
        }
    };

    const handleHealthCheck = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!readmeContent) {
            setHealthCheckError("No README content available for analysis.");
            return;
        }

        setIsHealthCheckLoading(true);
        setHealthCheckError(null);
        setHealthCheckResult(null);

        try {
            const response = await aiService.checkRepoHealth(readmeContent);
            setHealthCheckResult(response);
        } catch (err: any) {
            setHealthCheckError(err.message || "An unexpected error occurred.");
        } finally {
            setIsHealthCheckLoading(false);
        }
    };

    return (
        <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 text-gray-800 dark:text-gray-100 uppercase tracking-wider flex items-center">
                <Sparkles size={14} className="mr-2 text-secondary" />
                AI Assistant
            </h3>
            
            <div className="bg-base-100 dark:bg-base-900/50 border border-base-200 dark:border-base-800 rounded-xl overflow-hidden shadow-sm">
                {/* Summary Section */}
                <div className="border-b border-base-200 dark:border-base-800 last:border-0">
                    <button
                        type="button"
                        onClick={handleGenerateSummary}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 dark:text-base-200 hover:bg-base-50 dark:hover:bg-base-800 transition"
                    >
                        <div className="flex items-center">
                            <BookOpen size={16} className="mr-2 text-primary" />
                            Summarize Repo
                        </div>
                        {isSummaryOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    
                    {isSummaryOpen && (
                        <div className="px-4 pb-4 bg-base-50 dark:bg-base-950/30 border-t border-base-200 dark:border-base-800">
                            {isSummaryLoading ? (
                                <SummarySkeleton />
                            ) : summaryError ? (
                                <div className="flex items-start text-xs text-red-500 mt-2">
                                     <AlertTriangle size={14} className="mr-1.5 flex-shrink-0 mt-0.5" />
                                     <span>{summaryError}</span>
                                </div>
                            ) : summary ? (
                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 prose-sm">
                                    <MarkdownRenderer content={summary} />
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>

                {/* Health Check Section */}
                <div className="p-2">
                    <button
                        type="button"
                        onClick={handleHealthCheck}
                        disabled={isHealthCheckLoading}
                        className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-base-200 bg-base-200 dark:bg-base-800 rounded-lg hover:bg-base-300 dark:hover:bg-base-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isHealthCheckLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Activity size={16} className="mr-2 text-green-500" />}
                        Check Repo Health
                    </button>
                    {healthCheckError && <p className="text-xs text-red-500 mt-2 px-2 text-center">{healthCheckError}</p>}
                    {healthCheckResult && (
                        <div className="mt-3 p-3 bg-base-50 dark:bg-base-950 rounded-lg text-sm text-gray-600 dark:text-gray-400 border border-base-200 dark:border-base-800">
                            <MarkdownRenderer content={healthCheckResult} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AISidebarFeatures;
