
import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { MessageSquare, Share2, GitPullRequest, Bookmark, CheckCircle2, Circle, Clock, FileCode, ArrowLeftRight, FolderTree } from 'lucide-react';

const RoadmapItem: React.FC<{ 
  icon: React.ElementType, 
  title: string, 
  desc: string, 
  status: 'planned' | 'in-progress' | 'completed' 
}> = ({ icon: Icon, title, desc, status }) => {
  
  const statusConfig = {
    planned: { color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800', text: 'Planned', badgeColor: 'bg-gray-500' },
    'in-progress': { color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'In Progress', badgeColor: 'bg-blue-500' },
    completed: { color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', text: 'Completed', badgeColor: 'bg-green-500' },
  };

  const config = statusConfig[status];

  return (
    <div className="flex flex-col h-full p-6 bg-white dark:bg-base-900 rounded-xl border border-base-200 dark:border-base-800 shadow-sm relative overflow-hidden hover:border-primary/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${config.bg} ${config.color}`}>
              <Icon size={24} />
          </div>
          <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider text-white rounded-full ${config.badgeColor}`}>
              {config.text}
          </span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-base-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
};

export default function RoadmapPage() {
  return (
    <div className="min-h-screen flex flex-col bg-base-50 dark:bg-base-950">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4">
              Product Roadmap
            </h1>
            <p className="text-xl text-gray-600 dark:text-base-300 max-w-2xl mx-auto">
              See what we're working on and what's coming next to GitRover.
            </p>
          </div>

          <div className="space-y-12">
            {/* In Progress Section */}
            <section>
              <div className="flex items-center mb-6">
                <Clock className="text-blue-500 mr-3" size={28} />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">In Progress</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <RoadmapItem 
                    icon={MessageSquare}
                    title="Chat with Repo (RAG)"
                    status="in-progress"
                    desc="Ask questions like 'Where is the auth logic?' and get answers based on the entire codebase context using Retrieval-Augmented Generation."
                />
              </div>
            </section>

             {/* Planned Section */}
             <section>
              <div className="flex items-center mb-6">
                <Circle className="text-gray-500 mr-3" size={28} />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Planned Features</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RoadmapItem 
                    icon={Share2}
                    title="Visual Dependency Graph"
                    status="planned"
                    desc="Interactive 2D/3D node graphs to visualize file dependencies and project architecture at a glance."
                />
              </div>
            </section>

             {/* Completed Section (Example) */}
             <section>
              <div className="flex items-center mb-6">
                <CheckCircle2 className="text-green-500 mr-3" size={28} />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Completed</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <RoadmapItem 
                    icon={GitPullRequest}
                    title="AI PR Reviewer"
                    status="completed"
                    desc="Get instant AI summaries of Open Pull Requests to understand the impact of changes before you review the code."
                />
                 <RoadmapItem 
                    icon={Bookmark}
                    title="Local Bookmarks"
                    status="completed"
                    desc="Save repositories and gists locally in your browser for quick access without needing a GitHub account."
                />
                 <RoadmapItem 
                    icon={FileCode}
                    title="Gist Explorer"
                    status="completed"
                    desc="Full support for viewing user Gists, including AI explanations for code snippets."
                />
                 <RoadmapItem 
                    icon={ArrowLeftRight}
                    title="Release Comparison"
                    status="completed"
                    desc="Compare version differences between any two releases to see what changed in commits and files."
                />
                 <RoadmapItem 
                    icon={FolderTree}
                    title="Advanced File Explorer"
                    status="completed"
                    desc="Improved sorting (Last Modified), filtering, and layout for better file navigation."
                />
              </div>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
