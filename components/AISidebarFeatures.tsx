import React, { useState, useEffect } from 'react';
import { aiService } from '../services/aiService';
import { githubApi } from '../services/githubApi';
import { Sparkles, Activity, BookOpen, ChevronDown, ChevronUp, Bot, FileText, HeartPulse } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { Repo, Content } from '../types';
import CustomLoader from './common/CustomLoader';

// --- New Types & Components ---

interface HealthData {
  analysis: string;
  health_score: number;
}

const HealthGauge: React.FC<{ score: number }> = ({ score }) => {
    const [displayScore, setDisplayScore] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setDisplayScore(score), 100);
        return () => clearTimeout(timer);
    }, [score]);
    
    const percentage = Math.min(Math.max(displayScore, 0), 100);
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const arcLength = circumference / 2;
    const offset = arcLength - (percentage / 100) * arcLength;

    const getColorClasses = () => {
        if (score < 50) return { text: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20' };
        if (score < 80) return { text: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/20' };
        return { text: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' };
    };

    const getLabel = () => {
        if (score < 50) return 'Needs Improvement';
        if (score < 80) return 'Good';
        return 'Excellent';
    };
    
    const color = getColorClasses();

    return (
        <div className="flex flex-col items-center mb-4 animate-fade-in">
            <svg width="160" height="95" viewBox="0 0 120 75" className="-mb-2">
                <defs>
                    <linearGradient id="gauge-gradient-red" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#f87171" />
                    </linearGradient>
                    <linearGradient id="gauge-gradient-yellow" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#facc15" />
                    </linearGradient>
                     <linearGradient id="gauge-gradient-green" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#4ade80" />
                    </linearGradient>
                </defs>
                <path
                    d="M 10 60 A 50 50 0 0 1 110 60"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-base-200 dark:text-base-800"
                    strokeLinecap="round"
                />
                <path
                    d="M 10 60 A 50 50 0 0 1 110 60"
                    fill="none"
                    stroke={`url(#gauge-gradient-${score < 50 ? 'red' : score < 80 ? 'yellow' : 'green'})`}
                    strokeWidth="10"
                    strokeDasharray={arcLength}
                    strokeDashoffset={offset}
                    className="transition-all duration-[2000ms] ease-out"
                    strokeLinecap="round"
                />
                <text
                    x="60"
                    y="55"
                    textAnchor="middle"
                    className="text-3xl font-extrabold fill-current text-gray-800 dark:text-gray-100 transition-opacity duration-500"
                >
                    {Math.round(percentage)}
                </text>
                 <text
                    x="60"
                    y="68"
                    textAnchor="middle"
                    className="text-[8px] font-bold uppercase tracking-wider fill-current text-gray-400 dark:text-gray-500"
                >
                    Health Score
                </text>
            </svg>
             <div className={`px-3 py-1 rounded-full text-xs font-bold ${color.bg} ${color.text}`}>
                {getLabel()}
            </div>
        </div>
    );
};


interface AISidebarFeaturesProps {
    repo: Repo;
    readmeContent: string | null;
}

const FeatureCard: React.FC<{
    title: string;
    icon: React.ElementType;
    isOpen: boolean;
    isLoading: boolean;
    result: string | HealthData | null;
    error: string | null;
    onToggle: () => void;
    colorClass: string;
    buttonText: string;
    isHealthCard?: boolean;
}> = ({ title, icon: Icon, isOpen, isLoading, result, error, onToggle, colorClass, buttonText, isHealthCard = false }) => {
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
                        <div className="animate-fade-in">
                            {isHealthCard && result && typeof result === 'object' && 'health_score' in result ? (
                                <>
                                    <HealthGauge score={result.health_score} />
                                    <div className="mt-4 prose-sm text-sm text-gray-600 dark:text-gray-300">
                                        <MarkdownRenderer content={result.analysis} />
                                    </div>
                                </>
                            ) : (
                                <div className="prose-sm text-sm text-gray-600 dark:text-gray-300">
                                    <MarkdownRenderer content={result as string} />
                                </div>
                            )}
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
    const [healthResult, setHealthResult] = useState<HealthData | null>(null);
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

    const toggleHealth = async () => {
        if (!isHealthOpen) {
            setIsHealthOpen(true);
            setIsSummaryOpen(false); // Accordion behavior

            if (!healthResult && !isHealthLoading) {
                setIsHealthLoading(true);
                setHealthError(null);

                try {
                    // 1. Fetch the entire file tree
                    const treeRes = await githubApi.getTree(repo.owner.login, repo.name, repo.default_branch || 'main', true);
                    const allFilePaths = treeRes.data.tree.map(file => file.path).filter(path => path !== undefined) as string[];

                    // 2. Identify and fetch content for key files
                    const KEY_FILES = ['readme.md', 'contributing.md', 'package.json', 'license', 'dockerfile', 'makefile'];
                    const keyFilePromises = allFilePaths
                        .filter(path => KEY_FILES.some(keyFile => path.toLowerCase().includes(keyFile)))
                        .slice(0, 5) // Limit to 5 key files to avoid excessive API calls
                        .map(async path => {
                            try {
                                const contentRes = await githubApi.getContents(repo.owner.login, repo.name, path, repo.default_branch);
                                // FIX: The API response can be a directory listing (array) or a single file.
                                // Added a check to ensure we only process single file responses. This resolves the type error.
                                if (contentRes.data && !Array.isArray(contentRes.data)) {
                                    const fileData = contentRes.data as Content;
                                    if (fileData.content) {
                                        return { path, content: atob(fileData.content) };
                                    }
                                }
                                return null;
                            } catch {
                                return null;
                            }
                        });
                    
                    const settledKeyFiles = await Promise.allSettled(keyFilePromises);
                    const keyFiles = settledKeyFiles
                        .filter(result => result.status === 'fulfilled' && result.value)
                        .map(result => (result as PromiseFulfilledResult<any>).value);

                    // 3. Call AI service and parse response
                    const resultString = await aiService.checkRepoHealth({
                        filePaths: allFilePaths,
                        keyFiles: keyFiles
                    });
                    
                    try {
                        const parsedResult = JSON.parse(resultString);
                        if (parsedResult && typeof parsedResult.analysis === 'string' && typeof parsedResult.health_score === 'number') {
                            setHealthResult(parsedResult);
                        } else {
                            throw new Error("Invalid AI response format.");
                        }
                    } catch (parseError) {
                        setHealthError("Failed to parse AI response. The model may have returned an unexpected format.");
                    }

                } catch (err: any) {
                    setHealthError(err.message || "Failed to analyze repository health.");
                } finally {
                    setIsHealthLoading(false);
                }
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
                    isHealthCard={true}
                />
            </div>
        </div>
    );
};

export default AISidebarFeatures;