
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Repo } from '../types';
import { X, Download, Copy, Github, Code } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface CloneModalProps {
  repo: Repo;
  onClose: () => void;
}

const TabButton: React.FC<{
  name: string;
  activeTab: string;
  setActiveTab: (name: string) => void;
  children: React.ReactNode;
}> = ({ name, activeTab, setActiveTab, children }) => (
    <button
        onClick={() => setActiveTab(name)}
        className={`flex-1 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
            activeTab === name
            ? 'bg-white dark:bg-base-800 text-gray-800 dark:text-white shadow-sm'
            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
    >
        {children}
    </button>
);

const CloneInput: React.FC<{
  value: string;
  onCopy: () => void;
}> = ({ value, onCopy }) => (
    <div className="flex items-center">
        <input 
            readOnly 
            value={value} 
            className="flex-1 min-w-0 bg-base-100 dark:bg-base-800 text-xs p-2 rounded-l-md border border-r-0 border-base-300 dark:border-base-700 text-gray-600 dark:text-gray-300 focus:outline-none font-mono"
        />
        <button 
            onClick={onCopy}
            className="p-2 bg-base-100 dark:bg-base-800 border border-l-0 border-base-300 dark:border-base-700 rounded-r-md hover:bg-base-200 dark:hover:bg-base-700 transition-colors"
            title="Copy to clipboard"
        >
            <Copy size={14} className="text-gray-500" />
        </button>
    </div>
);

const CloneModal: React.FC<CloneModalProps> = ({ repo, onClose }) => {
  const [activeTab, setActiveTab] = useState<'https' | 'ssh' | 'cli'>('https');
  const { addToast } = useToast();

  const cloneUrl = repo.clone_url || `https://github.com/${repo.full_name}.git`;
  const sshUrl = repo.ssh_url || `git@github.com:${repo.full_name}.git`;
  const cliCommand = `gh repo clone ${repo.full_name}`;
  const downloadUrl = `${repo.html_url}/archive/refs/heads/${repo.default_branch || 'main'}.zip`;

  const handleCopy = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    addToast(message, 'success');
  };
  
  const portalRoot = document.getElementById('portal-root');
  if (!portalRoot) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center sm:justify-center animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white dark:bg-base-900 w-full sm:max-w-md rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden animate-slide-in-up sm:animate-fade-in" 
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-base-200 dark:border-base-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Code size={18} />
            Clone Repository
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-base-100 dark:hover:bg-base-800 transition text-gray-500">
            <X size={18} />
          </button>
        </header>

        <div className="p-4 space-y-4">
            <div className="bg-base-100 dark:bg-base-900 p-1 rounded-lg inline-flex shadow-inner border border-base-200 dark:border-base-800 w-full">
                <TabButton name="https" activeTab={activeTab} setActiveTab={setActiveTab}>HTTPS</TabButton>
                <TabButton name="ssh" activeTab={activeTab} setActiveTab={setActiveTab}>SSH</TabButton>
                <button
                    onClick={() => setActiveTab('cli')}
                    className={`flex-1 px-3 py-2 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                        activeTab === 'cli'
                        ? 'bg-white dark:bg-base-800 text-gray-800 dark:text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    <Github size={12} />
                    GitHub CLI
                </button>
            </div>
            
            <div>
                {activeTab === 'https' && <CloneInput value={cloneUrl} onCopy={() => handleCopy(cloneUrl, 'HTTPS URL copied!')} />}
                {activeTab === 'ssh' && <CloneInput value={sshUrl} onCopy={() => handleCopy(sshUrl, 'SSH URL copied!')} />}
                {activeTab === 'cli' && <CloneInput value={cliCommand} onCopy={() => handleCopy(cliCommand, 'CLI command copied!')} />}
            </div>
        </div>
        
        <footer className="p-4 bg-base-50 dark:bg-base-950/50 border-t border-base-200 dark:border-base-800">
          <a 
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-base-800 rounded-lg hover:bg-base-100 dark:hover:bg-base-700 transition-colors border border-base-200 dark:border-base-700 font-semibold"
          >
            <Download size={16} className="mr-2.5 text-gray-500" />
            Download ZIP
          </a>
        </footer>
      </div>
    </div>,
    portalRoot
  );
};

export default CloneModal;
