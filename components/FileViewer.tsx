
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { githubApi } from '../services/githubApi';
import { Content } from '../types';
import { X, Download, File as FileIcon, Sparkles, Copy } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import AIExplanationModal from './AIExplanationModal';
import { useSettings } from '../contexts/SettingsContext';
import { getLanguageFromFilename } from '../utils/languageUtils';
import { useToast } from '../contexts/ToastContext';
import CustomLoader from './common/CustomLoader';

interface FileViewerProps {
  owner: string;
  repoName: string;
  file: Content;
  onClose: () => void;
  branch: string;
}

interface FileContentData extends Content {
  content?: string;
}

const FileViewer: React.FC<FileViewerProps> = ({ owner, repoName, file, onClose, branch }) => {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedText, setSelectedText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const fontSizeRef = useRef(fontSize);
  const contentRef = useRef<HTMLDivElement>(null);
  const { activeSyntaxTheme } = useSettings();
  const { addToast } = useToast();

  // State for Code Folding
  const [foldableRanges, setFoldableRanges] = useState<{ start: number; end: number }[]>([]);
  const [foldedLines, setFoldedLines] = useState<Set<number>>(new Set());

  useEffect(() => {
    setLoading(true);
    githubApi.getContents(owner, repoName, file.path, branch)
      .then(response => {
        if (Array.isArray(response.data)) {
          setContent('Error: Path is a directory, not a file.');
          return;
        }
        const fileData = response.data as FileContentData;
        if(fileData.content) {
          setContent(atob(fileData.content));
        } else {
          setContent('File content is too large to display.');
        }
      })
      .catch(() => setContent('Could not load file content.'))
      .finally(() => setLoading(false));
  }, [owner, repoName, file.path, branch]);

  // Sync ref with state
  useEffect(() => {
    fontSizeRef.current = fontSize;
  }, [fontSize]);

  // Calculate foldable code ranges when content is loaded
  useEffect(() => {
    if (content) {
        const lines = content.split('\n');
        const ranges: { start: number; end: number }[] = [];
        const stack: { line: number; token: string }[] = [];
        
        // Simpler robust regex to find open/close pairs
        const openTokens = ['{', '[', '('];
        const closeTokens = ['}', ']', ')'];
        
        lines.forEach((line, i) => {
            const lineNumber = i + 1;
            const trimmedLine = line.trim();
            
            // Skip comments to avoid false positives in folding logic
            if (trimmedLine.startsWith('//') || trimmedLine.startsWith('*') || trimmedLine.startsWith('#')) return;

            // Iterate through characters to handle nesting correctly
            for (let char of line) {
                if (openTokens.includes(char)) {
                    stack.push({ line: lineNumber, token: char });
                } else if (closeTokens.includes(char)) {
                    const last = stack[stack.length - 1];
                    // Check if it matches the last open token
                    if (last && openTokens.indexOf(last.token) === closeTokens.indexOf(char)) {
                         const startInfo = stack.pop()!;
                         // Only create a range if it spans multiple lines
                         if (lineNumber > startInfo.line) {
                             ranges.push({ start: startInfo.line, end: lineNumber });
                         }
                    }
                }
            }
        });

        // Filter out ranges that are completely contained within the start line of another range (duplicates)
        // and sort by start line
        const uniqueRanges = ranges
            .filter((range, index, self) => 
                index === self.findIndex((r) => r.start === range.start && r.end === range.end)
            )
            .sort((a, b) => a.start - b.start);

        setFoldableRanges(uniqueRanges);
        setFoldedLines(new Set());
    }
  }, [content]);

  const toggleFold = (startLine: number) => {
    setFoldedLines(prev => {
        const newSet = new Set(prev);
        if (newSet.has(startLine)) {
            newSet.delete(startLine);
        } else {
            newSet.add(startLine);
        }
        return newSet;
    });
  };
  
  // Handle Zoom via Wheel (Ctrl + Scroll)
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            e.stopPropagation();
            const delta = e.deltaY > 0 ? -1 : 1;
            setFontSize(prev => Math.min(Math.max(prev + delta, 10), 32));
        }
    };
    
    // Allow standard pinch-to-zoom on touch devices, handled natively mostly, 
    // but preventing wheel zoom interference.
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Handle selection logic
  useEffect(() => {
    const handleSelectionChange = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || !contentRef.current?.contains(selection.anchorNode)) {
            setSelectedText('');
            return;
        }

        const text = selection.toString().trim();
        if (text) {
            setSelectedText(text);
        } else {
            setSelectedText('');
        }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content).then(() => {
        addToast('File content copied to clipboard', 'success');
      });
    }
  };

  const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
  const isMarkdown = fileExtension === 'md';
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(fileExtension);
  const language = getLanguageFromFilename(file.name);

  const getLineProps = (lineNumber: number) => {
    const props: React.HTMLProps<HTMLElement> = {};
    const range = foldableRanges.find(r => r.start === lineNumber);
    const isFolded = foldedLines.has(lineNumber);

    // Hide lines that are inside a folded block
    const containingFold = foldableRanges.find(r => foldedLines.has(r.start) && lineNumber > r.start && lineNumber <= r.end);

    if (containingFold) {
        props.style = { display: 'none' };
        return props;
    }

    if (range) {
        props.className = `foldable-line ${isFolded ? 'folded' : ''}`;
        props.onClick = (e) => {
            // Only fold if clicking the gutter/indicator area, not text
            // But SyntaxHighlighter row click includes everything. 
            // We check if text is selected to avoid accidental folding while selecting.
            if (window.getSelection()?.toString()) return;
            
            // Allow folding toggle
            toggleFold(lineNumber);
        };
    }
    return props;
  };

  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center h-64"><CustomLoader size={64} text="Loading file..." /></div>;
    }
    if (!content) {
      return <p>No content to display.</p>;
    }
    if (isMarkdown) {
      return (
        <div className="select-text cursor-text">
            <MarkdownRenderer content={content} owner={owner} repoName={repoName} branch={branch} filePath={file.path} />
        </div>
      );
    }
    if (isImage) {
      return <img src={file.download_url!} alt={file.name} className="max-w-full h-auto rounded" />;
    }
    return (
      <div className="relative group">
        <SyntaxHighlighter
          language={language}
          style={activeSyntaxTheme}
          showLineNumbers
          wrapLines
          lineProps={getLineProps}
          lineNumberStyle={{ 
            minWidth: '3.5em', 
            paddingRight: '1em', 
            textAlign: 'right', 
            userSelect: 'none', 
            opacity: 0.5 
          }}
          customStyle={{ margin: 0, paddingTop: '2.5rem', userSelect: 'text', cursor: 'text' }}
          codeTagProps={{ 
            style: { 
                fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace', 
                fontSize: `${fontSize}px`,
                userSelect: 'text'
            } 
          }}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    );
  };

  const portalRoot = document.getElementById('portal-root');
  if (!portalRoot) return null;

  return createPortal(
    <>
        <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white dark:bg-base-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col relative" 
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-base-200 dark:border-base-800">
                <div className="flex items-center text-sm font-semibold truncate text-gray-800 dark:text-gray-100">
                    <FileIcon size={16} className="mr-2 text-gray-500" />
                    <span className="truncate">{file.path}</span>
                </div>
                <div className="flex items-center space-x-1">
                    <button onClick={handleCopy} className="p-2 rounded-full hover:bg-base-100 dark:hover:bg-base-800 transition text-gray-600 dark:text-gray-300">
                    <Copy size={18} />
                    </button>
                    {file.download_url && (
                    <a href={file.download_url} download target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-base-100 dark:hover:bg-base-800 transition text-gray-600 dark:text-gray-300">
                        <Download size={18} />
                    </a>
                    )}
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-base-100 dark:hover:bg-base-800 transition text-gray-600 dark:text-gray-300">
                        <X size={18} />
                    </button>
                </div>
                </header>
                
                <div className="p-4 overflow-auto relative flex-1 text-gray-800 dark:text-gray-200 select-none cursor-default" ref={contentRef}>
                    {renderContent()}
                </div>

                {/* Floating AI Action Dock - Centered at bottom of modal */}
                {selectedText && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
                        <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 ring-2 ring-white/20"
                        >
                            <Sparkles size={16} />
                            Explain Selection
                        </button>
                    </div>
                )}
            </div>
        </div>
        {isModalOpen && <AIExplanationModal codeSnippet={selectedText} onClose={() => setIsModalOpen(false)} />}
    </>,
    portalRoot
  );
};

export default FileViewer;
