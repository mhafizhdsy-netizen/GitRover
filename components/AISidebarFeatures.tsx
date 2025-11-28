
import React, { useState } from 'react';
import { aiService } from '../services/aiService';
import { Sparkles, Activity, BookOpen, ChevronDown, ChevronUp, Bot, FileText, HeartPulse } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { Repo } from '../types';
import CustomLoader from './common/CustomLoader';

interface AISidebarFeaturesProps {
    repo: Repo;
    readmeContent: string | null;
}

const FeatureCard: React.FC<{
    title: string;
    icon: React.ElementType;
    isOpen: boolean;
    isLoading: boolean;
    result: string | null;
    error: string | null;
    onToggle: () => void;
    colorClass: string;
    buttonText: string;
}> = ({ title, icon: Icon, isOpen, isLoading, result, error, onToggle, colorClass, buttonText }) => {
    return (
        <div className={`
            relative overflow-hidden rounded-xl border transition-all duration-300
            ${isOpen 
                ? 'bg-white dark:bg-base-900 border-primary/30 shadow-lg ring-1 ring-primary/20' 
                : 'bg-white/50 dark:bg-base-900/50 border-base-200 dark:border-base-800 hover:border-primary/30 hover:shadow-md'
            }
        `}>
            {/* Header / Trigger */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-3.5 text-left transition-colors focus:outline-none"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colorClass} text-white shadow-sm`}>
                        <Icon size={18} />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-gray-800 dark:text-gray-100">{title}</h4>
                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 block -mt-0.5">
                            Powered by Gemini 3.0
                        </span>
                    </div>
                </div>
                <div className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={18} />
                </div>
            </button>

            {/* Content Area */}
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 pt-0">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-base-200 dark:via-base-700 to-transparent mb-4"></div>
                    
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                            <CustomLoader size={32} />
                            <p className="text-xs font-medium text-primary animate-pulse">Thinking deeply...</p>
                        </div>
                    ) : error ? (
                        <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg text-xs text-red-600 dark:text-red-400">
                            <strong>Error:</strong> {error}
                        </div>
                    ) : result ? (
                        <div className="prose-sm text-sm text-gray-600 dark:text-gray-300 animate-fade-in">
                            <MarkdownRenderer content={result} />
                        </div>
                    ) : (
                        <div className="text-center py-2">
                             <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                Generate an AI-powered analysis for this repository.
                             </p>
                             <button 
                                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                                className="w-full py-2 bg-base-100 dark:bg-base-800 hover:bg-base-200 dark:hover:bg-base-700 text-primary font-semibold text-xs rounded-lg transition-colors border border-base-200 dark:border-base-700"
                            >
                                {buttonText}
                             </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AISidebarFeatures: React.FC<AISidebarFeaturesProps> = ({ repo, readmeContent }) => {
    // Summary State
    const [summary, setSummary] = useState<string | null>(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);

    // Health Check State
    const [healthResult, setHealthResult] = useState<string | null>(null);
    const [isHealthLoading, setIsHealthLoading] = useState(false);
    const [healthError, setHealthError] = useState<string | null>(null);
    const [isHealthOpen, setIsHealthOpen] = useState(false);

    const toggleSummary = () => {
        if (!isSummaryOpen) {
            setIsSummaryOpen(true);
            setIsHealthOpen(false); // Accordion behavior (optional)
            
            // Fetch if not present
            if (!summary && !isSummaryLoading) {
                if (!readmeContent && !repo.description) {
                    setSummaryError("Not enough info to generate summary.");
                    return;
                }
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

    const toggleHealth = () => {
        if (!isHealthOpen) {
            setIsHealthOpen(true);
            setIsSummaryOpen(false); // Accordion behavior (optional)

            if (!healthResult && !isHealthLoading) {
                 if (!readmeContent) {
                    setHealthError("No README content available.");
                    return;
                }
                setIsHealthLoading(true);
                setHealthError(null);

                aiService.checkRepoHealth(readmeContent)
                .then(setHealthResult)
                .catch(err => setHealthError(err.message || "Failed to check health."))
                .finally(() => setIsHealthLoading(false));
            }
        } else {
            setIsHealthOpen(false);
        }
    };

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={12} className="text-secondary" />
                    AI Insights
                </h3>
            </div>
            
            <div className="space-y-3">
                <FeatureCard 
                    title="Smart Summary"
                    icon={FileText}
                    isOpen={isSummaryOpen}
                    isLoading={isSummaryLoading}
                    result={summary}
                    error={summaryError}
                    onToggle={toggleSummary}
                    colorClass="bg-gradient-to-br from-blue-500 to-indigo-600"
                    buttonText="Generate Summary"
                />

                <FeatureCard 
                    title="Repo Health"
                    icon={HeartPulse}
                    isOpen={isHealthOpen}
                    isLoading={isHealthLoading}
                    result={healthResult}
                    error={healthError}
                    onToggle={toggleHealth}
                    colorClass="bg-gradient-to-br from-emerald-500 to-teal-600"
                    buttonText="Analyze Health"
                />
            </div>
        </div>
    );
};

export default AISidebarFeatures;
