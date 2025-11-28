
import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { Code, Cpu, Shield, Layout, Zap, ArrowRight, GitBranch, Calendar, Rocket, Sparkles, Layers, PencilRuler } from 'lucide-react';
import { GitRoverIcon } from '../assets/icon';
import SEO from '../components/common/SEO';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-base-50 dark:bg-base-950">
      <SEO title="About GitRover - Our Mission & Principles" description="Learn about the mission, journey, and core principles behind GitRover." />
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative text-center py-24 sm:py-32 overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-20 [--aurora:repeating-linear-gradient(100deg,theme(colors.primary)_10%,theme(colors.secondary)_30%,theme(colors.primary)_50%)] [background-image:var(--aurora)] [background-size:300%_100%] animate-aurora"></div>
            <div className="sparkle-bg"></div>
            <div className="container mx-auto px-4 relative z-10 animate-fade-in">
                <div className="inline-block p-4 mb-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 shadow-lg">
                    <GitRoverIcon className="w-16 h-16" />
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-8 tracking-tight">
                    More than a Browser. It's an Insight Engine.
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 dark:text-base-300 leading-relaxed max-w-3xl mx-auto">
                    We're on a mission to make open-source code more accessible and understandable for everyone, from students to senior engineers.
                </p>
            </div>
        </section>

        {/* Our Journey Section */}
        <section className="py-24 bg-white dark:bg-base-900">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Journey</h2>
                    <p className="text-lg text-gray-600 dark:text-base-400 max-w-3xl mx-auto">
                        From a simple idea to an AI-powered tool.
                    </p>
                </div>
                <div className="relative max-w-2xl mx-auto">
                    <div className="absolute left-3.5 sm:left-1/2 top-4 h-[calc(100%-2rem)] w-1 bg-gradient-to-b from-transparent via-primary/20 to-transparent"></div>
                    {[
                        { icon: GitBranch, date: 'Q1 2025', title: 'Concept & First Commit', text: 'The idea for a minimalist GitHub reader was born. The first lines of code were written, focusing on a clean, fast file explorer.' },
                        { icon: Sparkles, date: 'Q2 2025', title: 'AI Integration', text: 'We integrated Google Gemini, introducing the "Explain Code" feature and repository summarization to provide deeper insights.' },
                        { icon: Rocket, date: 'Q3 2025', title: 'Version 2.0 Launch', text: 'Launched with a refined UI, multiple themes, and a robust feature set, establishing GitRover as a powerful developer tool.' },
                        { icon: Layers, date: 'Q4 2025', title: 'Ecosystem Expansion', text: 'Expanded capabilities with local bookmarks, Gist exploration, release comparison tools, and enhanced sorting options.' },
                        { icon: PencilRuler, date: 'Late 2025', title: 'UX Refinement', text: 'Implemented advanced file sorting, layout improvements, and comprehensive commit tracking features.' },
                        { icon: Calendar, date: 'Future 2025+', title: 'Continuous Improvement', text: 'We are constantly adding new features, themes, and performance enhancements based on community feedback.' },
                    ].map((item, i) => (
                        <div key={i} className="relative flex items-start sm:items-center sm:gap-x-8 mb-12">
                            <div className="hidden sm:flex w-1/2 ${i % 2 === 0 ? 'justify-end' : ''}">
                                {i % 2 !== 0 && (
                                    <div className="w-full p-6 bg-base-50 dark:bg-base-800/50 rounded-xl border border-base-200 dark:border-base-700 shadow-sm">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{item.title}</h3>
                                        <p className="text-sm text-gray-600 dark:text-base-400">{item.text}</p>
                                    </div>
                                )}
                            </div>
                            <div className="absolute sm:relative left-0 sm:left-auto flex-shrink-0 z-10">
                                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center ring-8 ring-base-50 dark:ring-base-900">
                                    <item.icon size={16} />
                                </div>
                            </div>
                            <div className="w-full sm:w-1/2 pl-12 sm:pl-0">
                                <p className="text-sm font-semibold text-primary mb-1">{item.date}</p>
                                <div className={`${i % 2 === 0 ? '' : 'sm:hidden'}`}>
                                    <div className="w-full p-6 bg-base-50 dark:bg-base-800/50 rounded-xl border border-base-200 dark:border-base-700 shadow-sm">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{item.title}</h3>
                                        <p className="text-sm text-gray-600 dark:text-base-400">{item.text}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Core Principles Section */}
        <section className="py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Core Principles</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { icon: Code, title: 'Focus on Code', text: 'A clean, distraction-free interface that puts the content first.' },
                        { icon: Cpu, title: 'AI-Powered Context', text: 'Turn raw code into insights with integrated Google Gemini.' },
                        { icon: Shield, title: 'Client-Side Privacy', text: 'Your tokens and data never leave your browser.' },
                        { icon: Layout, title: 'Elegant Design', text: 'A thoughtful, mobile-first design that works everywhere.' },
                    ].map((item, i) => (
                        <div key={i} className="bg-base-50 dark:bg-base-950/50 p-6 rounded-2xl border border-base-200 dark:border-base-800 hover:-translate-y-1 hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                            <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 text-primary rounded-xl mb-4">
                                <item.icon size={24} />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{item.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-base-400 leading-relaxed">{item.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
            <div className="container mx-auto px-4">
                <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-3xl p-12 text-center relative overflow-hidden">
                    <div className="absolute -inset-2 bg-base-900/50 mix-blend-multiply rounded-3xl"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-6">Ready to explore?</h2>
                        <p className="text-white/80 mb-8 max-w-xl mx-auto">
                            Dive into your favorite repositories with a fresh perspective.
                        </p>
                        <a href="/#/search" className="inline-flex items-center px-8 py-3 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition-transform hover:scale-105 shadow-lg">
                            Start Searching <ArrowRight className="ml-2" size={18} />
                        </a>
                    </div>
                </div>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
