
import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Zap, Shield, Smartphone, Terminal, Star, Sparkles, Layout, Globe, MessageSquare } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { GitRoverIcon } from '../assets/icon';
import { ThemeContext } from '../contexts/ThemeContext';
import SEO from '../components/common/SEO';
import { createWebSiteSchema } from '../utils/structuredData';

// New Component for Scroll Animations
const RevealOnScroll = ({ 
    children, 
    className = "", 
    delay = 0, 
    direction = 'up' 
}: { 
    children?: React.ReactNode, 
    className?: string, 
    delay?: number, 
    direction?: 'up' | 'down' | 'left' | 'right' 
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setTimeout(() => setIsVisible(true), delay);
                observer.disconnect();
            }
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [delay]);

    const getHiddenState = () => {
        switch (direction) {
            case 'left': return '-translate-x-12';
            case 'right': return 'translate-x-12';
            case 'down': return '-translate-y-12';
            case 'up': 
            default: return 'translate-y-12';
        }
    };

    return (
        <div 
            ref={ref} 
            className={`transition-all duration-1000 ease-out transform ${
                isVisible 
                ? 'opacity-100 translate-y-0 translate-x-0 blur-0' 
                : `opacity-0 blur-sm ${getHiddenState()}`
            } ${className}`}
        >
            {children}
        </div>
    );
};

const FeatureCard: React.FC<{ icon: React.ElementType, title: string, desc: string, comingSoon?: boolean }> = ({ icon: Icon, title, desc, comingSoon }) => (
  <div className={`bg-white dark:bg-base-900 p-6 rounded-2xl shadow-sm border border-base-200 dark:border-base-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 h-full relative overflow-hidden ${comingSoon ? 'opacity-80' : ''}`}>
    {comingSoon && (
        <div className="absolute top-0 right-0 bg-secondary text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
            SOON
        </div>
    )}
    <div className="w-12 h-12 bg-base-100 dark:bg-base-800 rounded-xl flex items-center justify-center mb-4 text-primary">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{title}</h3>
    <p className="text-gray-600 dark:text-base-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const TestimonialCard: React.FC<{ name: string, role: string, text: string, avatar: string }> = ({ name, role, text, avatar }) => (
  <div className="bg-white dark:bg-base-900/80 p-5 rounded-2xl relative h-full w-80 flex-shrink-0 border border-base-200 dark:border-base-800 shadow-sm backdrop-blur-md">
    <div className="flex items-center mb-4">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary overflow-hidden mr-3">
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      </div>
      <div>
        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">{name}</h4>
        <p className="text-xs text-gray-500 dark:text-base-400">{role}</p>
      </div>
    </div>
    <div className="flex mb-3 text-yellow-400">
      {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
    </div>
    <p className="text-gray-600 dark:text-base-300 text-sm italic">"{text}"</p>
  </div>
);

const testimonials = [
    { name: "Elena Rodriguez", role: "AI/ML Engineer", text: "The AI code explanations are incredibly accurate. It's like having a senior dev on call 24/7. Saves me hours of deciphering complex algorithms.", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80" },
    { name: "Ben Carter", role: "DevOps Specialist", text: "GitRover is blazing fast. The clean interface makes navigating large monorepos a breeze. The repo health check is a nice touch for quick assessments.", avatar: "https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&w=100&q=80" },
    { name: "Aisha Khan", role: "Cybersecurity Analyst", text: "I value the client-side approach. Knowing my PAT never leaves my browser gives me peace of mind. It's secure by design.", avatar: "https://images.unsplash.com/photo-1542596768-5d1d21f1cf98?auto=format&fit=crop&w=100&q=80" },
    { name: "Marcus Chen", role: "Product Manager", text: "The repo summary feature is fantastic for getting a high-level overview of a new project without digging through the entire README.", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80" },
    { name: "Sophie Dubois", role: "UX/UI Designer", text: "Finally, a GitHub client that looks and feels modern. The themes are beautiful, and the mobile experience is flawless. A joy to use!", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80" },
    { name: "David Kim", role: "Full Stack Developer", text: "I love how fast it is compared to the native GitHub UI. The local bookmarking feature is something I didn't know I needed.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" },
    { name: "Isabella Rossi", role: "Data Scientist", text: "Exploring data-heavy projects is much easier with GitRover. The file viewer with syntax highlighting is perfect for Jupyter notebooks.", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" },
    { name: "Jordan Lee", role: "Tech Lead", text: "The AI PR reviewer provides a great starting point for my team. It helps spot potential issues before human review, streamlining our workflow.", avatar: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?auto=format&fit=crop&w=100&q=80" },
    { name: "Chloe Garcia", role: "Coding Bootcamp Student", text: "GitRover helps me learn by stripping away the noise. The AI explanations for concepts I don't understand are a lifesaver.", avatar: "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=100&q=80" },
    { name: "Kenji Tanaka", role: "Game Developer", text: "The release comparison tool is excellent for tracking changes between versions. It's much clearer than GitHub's default view.", avatar: "https://images.unsplash.com/photo-1595211877493-41a4ce1d23e4?auto=format&fit=crop&w=100&q=80" },
    { name: "Fatima Al-Jamil", role: "Open Source Contributor", text: "A fantastic tool for the open-source community. It lowers the barrier to understanding new and complex projects. Highly recommended.", avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=100&q=80" },
    { name: "Leo Maxwell", role: "Indie Hacker", text: "As a solo developer, GitRover is my go-to for quickly referencing libraries and frameworks. The Gist viewer is a huge plus.", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&q=80" },
    { name: "Nia Adebayo", role: "Mobile Developer", text: "The mobile-first design isn't just a buzzword here; it actually works beautifully on my phone for quick code checks on the go.", avatar: "https://images.unsplash.com/photo-1492681290082-e932832941e6?auto=format&fit=crop&w=100&q=80" },
    { name: "Ryan Patel", role: "Backend Engineer", text: "The minimalist interface helps me focus on what matters: the code. No distractions, just pure performance and utility.", avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=100&q=80" },
    { name: "Olivia Wilde", role: "Frontend Engineer", text: "The code folding and syntax theme options make reading large files so much more pleasant. It's the little details that make GitRover great.", avatar: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=100&q=80" },
    { name: "Daniel Smith", role: "Cloud Architect", text: "This tool is perfect for reviewing infrastructure-as-code repos. The AI can even explain complex Terraform configurations.", avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=100&q=80" },
    { name: "Maria Garcia", role: "QA Engineer", text: "GitRover's clear commit history and file diffs make it easy to trace changes and verify bug fixes. A huge help for my workflow.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" },
    { name: "James Brown", role: "Technical Writer", text: "The repo summary is a game-changer for writing documentation. It gives me a perfect starting point, saving tons of time.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" },
    { name: "Linda Williams", role: "Project Manager", text: "I'm not a developer, but GitRover's AI summaries help me understand what my team is working on at a high level. Incredibly useful!", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80" },
    { name: "Robert Johnson", role: "Security Researcher", text: "The ability to quickly browse file structures and read code without cloning is invaluable for security audits. A very efficient tool.", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" },
    { name: "Patricia Jones", role: "Professor of CS", text: "I recommend GitRover to all my students. It simplifies the often-intimidating GitHub interface and helps them learn by exploring real-world code.", avatar: "https://images.unsplash.com/photo-1520466207246-5925c04dba56?auto=format&fit=crop&w=100&q=80" },
];

export default function LandingPage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const themeContext = useContext(ThemeContext);
  const mode = themeContext?.mode || 'light';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const radialGradientStyle: React.CSSProperties = {
    backgroundImage: mode === 'light' 
      ? `radial-gradient(ellipse 200% 100% at 50% -20%, rgb(var(--color-secondary) / 0.2), transparent)`
      : `radial-gradient(ellipse 200% 100% at 50% -20%, rgb(var(--color-primary) / 0.3), transparent 80%)`
  };

  const auroraStyle: React.CSSProperties = {
    '--aurora': `repeating-linear-gradient(100deg, rgb(var(--color-primary)) 10%, rgb(var(--color-secondary)) 25%, rgb(var(--color-primary)) 40%)`
  } as React.CSSProperties;

  const firstRow = testimonials.slice(0, 7);
  const secondRow = testimonials.slice(7, 14);
  const thirdRow = testimonials.slice(14, 21);

  return (
    <div className="min-h-screen flex flex-col bg-base-50 dark:bg-base-950 overflow-x-hidden">
      <SEO 
        title="GitRover - Explore Code. Understand Faster." 
        description="A minimalist, AI-powered way to browse GitHub. Analyze repositories, generate summaries, and explain code instantly with Google Gemini."
        schema={createWebSiteSchema()}
      />
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div 
          className="absolute top-0 left-0 w-full h-full -z-10"
          style={radialGradientStyle}
        />
        <div 
          className="absolute inset-0 z-0 opacity-10 [background-image:var(--aurora)] [background-size:200%_100%] animate-aurora"
          style={auroraStyle}
        ></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <RevealOnScroll direction="down">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-base-200 dark:bg-base-800/50 border border-base-300 dark:border-base-700 mb-8">
                <span className="flex w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">v2.0 Now Available with AI</span>
            </div>
          </RevealOnScroll>
          
          <RevealOnScroll delay={100}>
            <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-6 tracking-tight">
                Explore Code.<br/>
                <span className="text-primary">Understand Faster.</span>
            </h1>
          </RevealOnScroll>
          
          <RevealOnScroll delay={200}>
            <p className="text-lg md:text-xl text-gray-600 dark:text-base-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                GitRover is the minimalist, AI-powered way to browse GitHub. 
                Analyze repositories, generate summaries, and explain code instantly.
            </p>
          </RevealOnScroll>
          
          <RevealOnScroll delay={300}>
            <form onSubmit={handleSearch} className="w-full max-w-lg mx-auto mb-12">
                <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <div className="relative flex items-center bg-white dark:bg-base-900 rounded-xl p-2 shadow-lg">
                    <Search className="ml-4 text-gray-400" size={20} />
                    <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search repositories (e.g., facebook/react)..."
                    className="w-full px-4 py-3 bg-transparent focus:outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400"
                    />
                    <button type="submit" className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors">
                    Search
                    </button>
                </div>
                </div>
            </form>
          </RevealOnScroll>

          <RevealOnScroll delay={400}>
            <div className="flex justify-center space-x-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                {/* Tech stack icons just for visual flair in hero */}
                <div className="flex items-center space-x-2"><Layout size={20} /> <span className="font-bold">React</span></div>
                <div className="flex items-center space-x-2"><Terminal size={20} /> <span className="font-bold">TypeScript</span></div>
                <div className="flex items-center space-x-2"><Sparkles size={20} /> <span className="font-bold">Gemini</span></div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-base-950 border-t border-base-200 dark:border-base-800">
        <div className="container mx-auto px-4">
          <RevealOnScroll>
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Everything you need</h2>
                <p className="text-gray-600 dark:text-base-400 max-w-2xl mx-auto">
                We've stripped away the clutter and added intelligence to help you focus on what matters: the code.
                </p>
            </div>
          </RevealOnScroll>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <RevealOnScroll delay={0} direction="left">
                <FeatureCard 
                icon={Sparkles} 
                title="AI Code Analysis" 
                desc="Don't just read code, understand it. Select any snippet and get an instant AI-powered explanation in plain English." 
                />
            </RevealOnScroll>
            <RevealOnScroll delay={100} direction="up">
                <FeatureCard 
                icon={Smartphone} 
                title="Mobile First" 
                desc="A responsive design that actually works on your phone. Browse repos, read commits, and check issues on the go." 
                />
            </RevealOnScroll>
            <RevealOnScroll delay={200} direction="right">
                <FeatureCard 
                icon={Zap} 
                title="Blazing Fast" 
                desc="Built with Vite and React for near-instant page loads. Optimized caching ensures you spend less time waiting." 
                />
            </RevealOnScroll>
            <RevealOnScroll delay={0} direction="left">
                <FeatureCard 
                icon={Shield} 
                title="Secure & Private" 
                desc="Your tokens never leave your browser. We use local storage for persistence and direct GitHub API calls." 
                />
            </RevealOnScroll>
            <RevealOnScroll delay={100} direction="up">
                <FeatureCard 
                icon={Layout} 
                title="Minimalist UI" 
                desc="A clean, distraction-free interface that puts the content first. Dark mode included by default." 
                />
            </RevealOnScroll>
            <RevealOnScroll delay={200} direction="right">
                <FeatureCard 
                icon={MessageSquare} 
                title="Chat with Repo" 
                desc="Coming soon: Chat directly with the codebase to ask questions about architecture, logic, and more."
                comingSoon
                />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Why GitRover Section */}
      <section className="py-24 bg-base-50 dark:bg-base-900/30 overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-12">
            <RevealOnScroll direction="left">
                <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Why choose GitRover?</h2>
                <p className="text-lg text-gray-600 dark:text-base-300 mb-6">
                GitHub is powerful, but sometimes it's overwhelming. GitRover offers a curated, reading-focused experience.
                </p>
                <ul className="space-y-4">
                {[
                    "Distraction-free reading mode for documentation",
                    "One-click repository health check via AI",
                    "Quick access to clone links and downloads",
                    "Seamless switching between file tree and code"
                ].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center mr-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    {item}
                    </li>
                ))}
                </ul>
            </RevealOnScroll>
          </div>
          <div className="md:w-1/2 relative">
             <RevealOnScroll delay={200} direction="right">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary rounded-2xl opacity-20 blur-lg"></div>
                <div className="relative bg-white dark:bg-base-950 rounded-2xl shadow-2xl border border-base-200 dark:border-base-800 overflow-hidden p-4">
                    <div className="flex items-center space-x-2 mb-4 border-b border-base-200 dark:border-base-800 pb-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 bg-base-100 dark:bg-base-800 rounded w-3/4"></div>
                        <div className="h-4 bg-base-100 dark:bg-base-800 rounded w-1/2"></div>
                        <div className="h-32 bg-base-100 dark:bg-base-800 rounded w-full mt-4 flex items-center justify-center text-gray-400">
                            <GitRoverIcon className="w-16 h-16 opacity-20" />
                        </div>
                    </div>
                </div>
             </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-base-50 dark:bg-base-900/30 overflow-hidden">
        <div className="container mx-auto px-4">
          <RevealOnScroll>
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Loved by Developers Worldwide</h2>
                <p className="text-gray-600 dark:text-base-400">Join thousands of developers exploring code the modern way.</p>
            </div>
          </RevealOnScroll>
        </div>

        <div className="relative">
            <div className="space-y-12 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                {/* Row 1 */}
                <div className="flex overflow-hidden">
                    <div className="flex space-x-12 animate-marquee-right [animation-duration:60s]">
                        {firstRow.map((t, i) => <TestimonialCard key={i} {...t} />)}
                    </div>
                    <div className="flex space-x-12 animate-marquee-right [animation-duration:60s]" aria-hidden="true">
                        {firstRow.map((t, i) => <TestimonialCard key={i} {...t} />)}
                    </div>
                </div>
                {/* Row 2 */}
                <div className="flex overflow-hidden">
                    <div className="flex space-x-12 animate-marquee-left [animation-duration:50s]">
                        {secondRow.map((t, i) => <TestimonialCard key={i} {...t} />)}
                    </div>
                    <div className="flex space-x-12 animate-marquee-left [animation-duration:50s]" aria-hidden="true">
                        {secondRow.map((t, i) => <TestimonialCard key={i} {...t} />)}
                    </div>
                </div>
                {/* Row 3 */}
                <div className="flex overflow-hidden">
                    <div className="flex space-x-12 animate-marquee-right [animation-duration:70s]">
                        {thirdRow.map((t, i) => <TestimonialCard key={i} {...t} />)}
                    </div>
                    <div className="flex space-x-12 animate-marquee-right [animation-duration:70s]" aria-hidden="true">
                        {thirdRow.map((t, i) => <TestimonialCard key={i} {...t} />)}
                    </div>
                </div>
            </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
