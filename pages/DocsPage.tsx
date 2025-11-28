
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { BookOpen, Search, Sparkles, Settings, HelpCircle, Layers, Link as LinkIcon, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';

const mainSections = [
  { id: 'intro', title: 'Introduction', icon: BookOpen },
  { id: 'search', title: 'Exploring & Searching', icon: Search },
  { id: 'repo-features', title: 'Repository Deep Dive', icon: Layers },
  { id: 'ai-features', title: 'AI Capabilities', icon: Sparkles },
  { id: 'settings', title: 'Settings & Config', icon: Settings },
  { id: 'faq', title: 'FAQ & Troubleshooting', icon: HelpCircle },
];

interface TocItem {
  id: string;
  text: string;
  level: number;
}

const DocsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('intro');
  const [activeSubSection, setActiveSubSection] = useState('');
  const [toc, setToc] = useState<TocItem[]>([]);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const leftSidebarRef = useRef<HTMLDivElement>(null);

  // Main section observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -80% 0px', threshold: 0 }
    );

    const sections = mainSections.map(s => document.getElementById(s.id)).filter(el => el);
    sections.forEach(el => observer.observe(el!));

    return () => sections.forEach(el => observer.unobserve(el!));
  }, []);

  // TOC generator and sub-section observer
  useEffect(() => {
    const sectionEl = document.getElementById(activeSection);
    if (!sectionEl) return;

    const headings = Array.from(sectionEl.querySelectorAll('h3, h4'));
    const newToc = headings.map(h => ({
      id: h.id,
      text: h.textContent || '',
      level: parseInt(h.tagName.substring(1), 10),
    }));
    setToc(newToc);

    if (newToc.length > 0) {
      setActiveSubSection(newToc[0].id);
    } else {
      setActiveSubSection('');
    }

    const subObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSubSection(entry.target.id);
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0.1 });

    headings.forEach(h => subObserver.observe(h));

    return () => headings.forEach(h => subObserver.unobserve(h));

  }, [activeSection]);


  const renderProse = (children: React.ReactNode) => (
    <div className="prose dark:prose-invert max-w-none prose-a:text-primary prose-a:font-medium hover:prose-a:underline prose-code:bg-base-200 dark:prose-code:bg-base-800 prose-code:px-1.5 prose-code:py-1 prose-code:rounded-md prose-code:font-mono prose-code:text-sm text-gray-700 dark:text-base-300 leading-relaxed space-y-4">
        {children}
    </div>
  );
  
  const Heading: React.FC<{as: 'h2' | 'h3' | 'h4', id: string, children: React.ReactNode}> = ({ as: Tag, id, children }) => (
    <Tag id={id} className="group scroll-mt-24 relative">
        <a href={`#${id}`} className="absolute -left-7 opacity-0 group-hover:opacity-100 transition-opacity">
            <LinkIcon size={16} className="text-gray-400" />
        </a>
        {children}
    </Tag>
  );

  return (
    <div className="min-h-screen flex flex-col bg-base-50 dark:bg-base-950">
      <Header />
      <div className="container mx-auto px-4 flex-grow">
        <div className="w-full max-w-screen-xl mx-auto flex">

          {/* Left Sidebar */}
          <aside className="w-60 flex-shrink-0 hidden lg:block">
            <div ref={leftSidebarRef} className="sticky top-24 space-y-1 py-4 pr-4">
              <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sections</h3>
              {mainSections.map(section => (
                <a 
                  key={section.id}
                  href={`#${section.id}`} 
                  className={`
                    group flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${activeSection === section.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 dark:text-base-300 hover:bg-base-100 dark:hover:bg-base-800 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  <section.icon size={16} className="mr-3 flex-shrink-0" />
                  <span>{section.title}</span>
                </a>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <main ref={contentRef} className="flex-1 min-w-0 py-12 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="relative mb-16 animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                  Documentation
                </h1>
                <p className="text-xl text-gray-600 dark:text-base-300">
                  Master GitRover's features to explore, analyze, and understand GitHub repositories faster than ever before.
                </p>
              </div>
              
              <div className="space-y-16">
                <section id="intro">
                  {renderProse(<>
                    <Heading as="h2" id="intro-main">Introduction</Heading>
                    <p>Welcome to GitRover! This is a specialized GitHub browser designed for <strong>readers</strong> of code. While GitHub's interface is built for collaboration (issues, PRs, management), GitRover is optimized for understanding existing codebases quickly.</p>
                    <div className="not-prose my-6 rounded-lg border-l-4 border-blue-400 bg-blue-50 dark:bg-blue-900/20 p-5">
                      <Heading as="h4" id="intro-philosophy">Core Philosophy</Heading>
                      <ul className="list-disc list-inside space-y-2 text-blue-700 dark:text-blue-200 text-sm mt-2">
                        <li><strong>Minimalism:</strong> Remove clutter to focus on content.</li>
                        <li><strong>Performance:</strong> Instant navigation and file loading.</li>
                        <li><strong>Context:</strong> AI-powered explanations where documentation is lacking.</li>
                      </ul>
                    </div>
                  </>)}
                </section>

                <section id="search">
                   {renderProse(<>
                    <Heading as="h2" id="search-main">Exploring & Searching</Heading>
                    <p>The explore experience starts at the <a href="/#/search">Search Page</a>. Our search engine leverages the GitHub API directly. You can find repositories using keywords (<code>machine learning</code>), repository name (<code>react</code>), or full name (<code>facebook/react</code>).</p>
                    <Heading as="h3" id="search-sorting">Sorting Results</Heading>
                    <p>Use the sorting dropdown next to the search bar to organize results by popularity (stars, forks), recent activity, and relevance.</p>
                   </>)}
                </section>

                <section id="repo-features">
                   {renderProse(<>
                    <Heading as="h2" id="repo-main">Repository Deep Dive</Heading>
                    <p>The repository detail page is the heart of GitRover, divided into logical sections to help you navigate large projects easily.</p>
                    <Heading as="h3" id="repo-file-explorer">File Explorer</Heading>
                    <p>Our custom-built file explorer offers a native-app-like experience with instant folder navigation, folder size calculation, file filtering, and easy branch switching.</p>
                    <Heading as="h3" id="repo-tabs">Project Tabs</Heading>
                    <p>Quickly jump between <strong>Code</strong>, <strong>Commits</strong>, <strong>Issues</strong>, <strong>Pull Requests</strong>, and the project's <strong>License</strong>.</p>
                   </>)}
                </section>

                <section id="ai-features">
                   {renderProse(<>
                    <Heading as="h2" id="ai-main">AI Capabilities</Heading>
                    <p>GitRover integrates <strong>Google Gemini AI</strong> to turn raw code into insights. This requires a self-configured API Key in settings.</p>
                    <Heading as="h3" id="ai-list">Available Features</Heading>
                    <ul>
                      <li><strong>Repository Summary:</strong> A concise one-paragraph pitch of the project.</li>
                      <li><strong>Repo Health Check:</strong> Analyzes documentation for "Red Flags" and quality.</li>
                      <li><strong>Contextual Code Explanation:</strong> Highlight any code to get a line-by-line breakdown from AI.</li>
                    </ul>
                   </>)}
                </section>

                <section id="settings">
                   {renderProse(<>
                    <Heading as="h2" id="settings-main">Settings & Config</Heading>
                    <Heading as="h3" id="settings-token">GitHub Token (Rate Limits)</Heading>
                    <p>GitHub restricts unauthenticated API requests to <strong>60 per hour</strong>. Add a Personal Access Token in Settings to increase the limit to <strong>5,000 requests/hour</strong>.</p>
                    
                    <div id="how-to-create-pat" className="not-prose my-6 bg-white dark:bg-base-900 border border-base-200 dark:border-base-800 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center mb-4">
                            <div className="p-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg mr-3">
                                <KeyRound size={24} />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white m-0">How to create a Personal Access Token</h4>
                        </div>
                        <ol className="list-decimal list-inside space-y-3 text-sm text-gray-600 dark:text-base-300">
                            <li>Log in to your GitHub account.</li>
                            <li>Go to <strong>Settings</strong> {'>'} <strong>Developer settings</strong> {'>'} <strong>Personal access tokens</strong> {'>'} <strong>Tokens (classic)</strong>.</li>
                            <li>Click on <strong>Generate new token (classic)</strong>.</li>
                            <li>Give your token a descriptive name (e.g., "GitRover").</li>
                            <li>In the <strong>Select scopes</strong> section, you only need to select <code>public_repo</code> (for accessing public repositories).</li>
                            <li>Click <strong>Generate token</strong> at the bottom of the page.</li>
                            <li><strong>Copy the token immediately</strong>. GitHub will not show it again.</li>
                            <li>Paste the token into the GitRover Settings menu.</li>
                        </ol>
                        <div className="mt-4 pt-4 border-t border-base-200 dark:border-base-800">
                             <a 
                                href="https://github.com/settings/tokens/new?scopes=public_repo&description=GitRover" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm font-semibold text-primary hover:underline"
                             >
                                Quick Link: Generate Token on GitHub <LinkIcon size={14} className="ml-1.5" />
                             </a>
                        </div>
                    </div>

                    <Heading as="h3" id="settings-themes">Syntax Themes</Heading>
                    <p>Customize your code reading experience in <strong>Settings</strong>. Choose from themes like VS Code Dark, Dracula, GitHub Light, Nord, and more.</p>
                   </>)}
                </section>

                <section id="faq">
                   {renderProse(<>
                    <Heading as="h2" id="faq-main">FAQ & Troubleshooting</Heading>
                    <Heading as="h3" id="faq-ratelimit">Why am I seeing "API rate limit exceeded"?</Heading>
                    <p>You have made more than 60 requests in an hour. Please add a GitHub Token in settings to continue.</p>
                    <Heading as="h3" id="faq-ai">Why isn't the AI responding?</Heading>
                    <p>AI features depend on the Google Gemini API. Ensure your <code>API_KEY</code> is set correctly in settings or environment variables if self-hosting.</p>
                    <Heading as="h3" id="faq-safety">Is my data safe?</Heading>
                    <p>Yes. GitRover operates entirely on the client-side. Your tokens and settings never leave your browser.</p>
                   </>)}
                </section>
              </div>
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="w-60 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24 space-y-2 py-4 pl-4">
              <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">On this page</h3>
              {toc.length > 0 ? (
                <ul className="space-y-2 border-l border-base-200 dark:border-base-800">
                  {toc.map(item => (
                    <li key={item.id}>
                      <a 
                        href={`#${item.id}`}
                        className={`
                          block border-l pl-4 py-1 text-sm transition-colors
                          ${activeSubSection === item.id 
                            ? 'text-primary border-primary font-semibold'
                            : 'text-gray-500 dark:text-base-400 hover:text-gray-800 dark:hover:text-white border-transparent hover:border-base-300 dark:hover:border-base-600'
                          }
                        `}
                        style={{ marginLeft: `${(item.level - 3) * 0.75}rem` }}
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-gray-400 pl-4 py-1">No sub-sections</div>
              )}
            </div>
          </aside>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DocsPage;
