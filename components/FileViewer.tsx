
import React, { useState, useEffect, useRef } from 'react';
import { githubApi } from '../services/githubApi';
import { Content } from '../types';
import { Loader2, X, Download, File as FileIcon, Sparkles, Copy } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import AIExplanationModal from './AIExplanationModal';
import { useSettings } from '../contexts/SettingsContext';
import { getLanguageFromFilename } from '../utils/languageUtils';
import { useToast } from '../contexts/ToastContext';

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
  const [buttonPosition, setButtonPosition] = useState<{ top: number; left: number } | null>(null);
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
        
        // Match pairs: { with }, [ with ], ( with ), and <tag> with </tag>
        const openTokens: Record<string, string> = { '{': '}', '[': ']', '(': ')' };
        const closeTokens: Record<string, string> = { '}': '{', ']': '[', ')': '(' };
        const tokenRegex = /<([a-zA-Z0-9_:-]+)(?![^>]*\/>)[^>]*>|<\/([a-zA-Z0-9_:-]+)>|[{}[\]()]/g;

        lines.forEach((line, i) => {
            const lineNumber = i + 1;
            const trimmedLine = line.trim();
            // Basic comment skipping for performance
            if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*') || trimmedLine.startsWith('#')) {
                return;
            }

            let match;
            while ((match = tokenRegex.exec(line)) !== null) {
                const fullMatch = match[0];
                const openingTag = match[1];
                const closingTag = match[2];
                const lastOpener = stack[stack.length - 1];

                if (openingTag) { // HTML open tag
                    stack.push({ line: lineNumber, token: openingTag });
                } else if (fullMatch in openTokens) { // Bracket open
                    stack.push({ line: lineNumber, token: fullMatch });
                } else if (closingTag) { // HTML close tag
                    if (lastOpener && lastOpener.token === closingTag) {
                        const startInfo = stack.pop()!;
                        if (lineNumber > startInfo.line) {
                            ranges.push({ start: startInfo.line, end: lineNumber });
                        }
                    }
                } else if (fullMatch in closeTokens) { // Bracket close
                    if (lastOpener && lastOpener.token === closeTokens[fullMatch]) {
                        const startInfo = stack.pop()!;
                        if (lineNumber > startInfo.line) {
                            ranges.push({ start: startInfo.line, end: lineNumber });
                        }
                    }
                }
            }
        });

        // Sort by start line, then by end line descending to get largest blocks first
        ranges.sort((a, b) => a.start - b.start || b.end - a.end);

        // Filter out nested ranges that start on the same line, keeping the outermost
        const uniqueRanges = ranges.filter((range, index, self) => 
            index === 0 || range.start !== self[index - 1].start
        );

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
  
  // Handle Zoom via Wheel (Ctrl + Scroll) or Touch Pinch
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    // --- Wheel Logic ---
    const handleWheel = (e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            e.stopPropagation();
            
            // e.deltaY < 0 means scrolling up (zoom in)
            // e.deltaY > 0 means scrolling down (zoom out)
            const delta = e.deltaY > 0 ? -1 : 1;
            
            setFontSize(prev => {
                const newSize = prev + delta;
                return Math.min(Math.max(newSize, 10), 32); // Clamp between 10px and 32px
            });
        }
    };

    // --- Touch Logic (Pinch to Zoom) ---
    let initialDistance: number | null = null;
    let initialFontSize: number | null = null;

    const getDistance = (touches: TouchList) => {
        return Math.hypot(
            touches[0].clientX - touches[1].clientX,
            touches[0].clientY - touches[1].clientY
        );
    };

    const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 2) {
            initialDistance = getDistance(e.touches);
            initialFontSize = fontSizeRef.current;
        }
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 2 && initialDistance !== null && initialFontSize !== null) {
            e.preventDefault();
            e.stopPropagation();

            const currentDistance = getDistance(e.touches);
            const ratio = currentDistance / initialDistance;
            const newSize = initialFontSize * ratio;
            
            setFontSize(Math.min(Math.max(newSize, 10), 32));
        }
    };

    const handleTouchEnd = () => {
        initialDistance = null;
        initialFontSize = null;
    };

    // Use passive: false to allow preventDefault
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    // Touch listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    return () => {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
        container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [loading]); // Re-attach if loading state changes (content re-renders)

  // Handle selection logic for both mouse and touch
  useEffect(() => {
    const handleSelectionChange = () => {
        const selection = window.getSelection();
        
        // 1. Basic checks for valid selection
        if (!selection || selection.rangeCount === 0) {
            setSelectedText('');
            setButtonPosition(null);
            return;
        }

        // 2. Ensure selection is inside our content container
        if (!contentRef.current?.contains(selection.anchorNode)) {
             // This check is mostly handled by CSS 'select-none' on the container now,
             // but we keep it for safety.
             return;
        }
        
        // 3. Get text, but verify it's not just whitespace
        const text = selection.toString().trim();
        
        if (text) {
            setSelectedText(text);
            
            // Only calculate position for desktop popup. 
            // Mobile will use a fixed bottom bar.
            if (window.matchMedia('(min-width: 768px)').matches) {
                try {
                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    const containerRect = contentRef.current.getBoundingClientRect();
                    
                    // Calculate relative position
                    setButtonPosition({
                        top: rect.top - containerRect.top - 40,
                        left: rect.left - containerRect.left + rect.width / 2,
                    });
                } catch (e) {
                    console.error("Error calculating selection position", e);
                    setButtonPosition(null);
                }
            } else {
                setButtonPosition(null); // Ensure floating button doesn't show on mobile
            }
        } else {
            setSelectedText('');
            setButtonPosition(null);
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
  
  // Use the utility to get the correct Prism language key
  const language = getLanguageFromFilename(file.name);

  const getLineProps = (lineNumber: number) => {
    const props: React.HTMLProps<HTMLElement> = {};
    const range = foldableRanges.find(r => r.start === lineNumber);
    const isFolded = foldedLines.has(lineNumber);

    const containingFold = foldableRanges.find(r => foldedLines.has(r.start) && lineNumber > r.start && lineNumber < r.end);

    if (containingFold) {
        props.style = { display: 'none' };
        return props;
    }

    if (range) {
        props.className = `foldable-line ${isFolded ? 'folded' : ''}`;
        props.onClick = (e) => {
            // Prevent text selection when folding
            if (window.getSelection()?.toString()) return;
            e.preventDefault();
            toggleFold(lineNumber);
        };
    }
    return props;
  };

  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" size={32} /></div>;
    }
    if (!content) {
      return <p>No content to display.</p>;
    }
    if (isMarkdown) {
      // Wrap markdown in select-text cursor-text to allow selection
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
          // IMPORTANT: Prevent line number selection to fix AI explain issues
          lineNumberStyle={{ 
            minWidth: '2.5em', 
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

  return (
    <>
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={onClose}>
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
                <button 
                  onClick={handleCopy}
                  className="p-2 rounded-full hover:bg-base-100 dark:hover:bg-base-800 transition text-gray-600 dark:text-gray-300"
                  title="Copy file content"
                >
                  <Copy size={18} />
                </button>
                {file.download_url && (
                <a 
                  href={file.download_url} 
                  download 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 rounded-full hover:bg-base-100 dark:hover:bg-base-800 transition text-gray-600 dark:text-gray-300"
                  title="Download raw file"
                >
                    <Download size={18} />
                </a>
                )}
                <button 
                  onClick={onClose} 
                  className="p-2 rounded-full hover:bg-base-100 dark:hover:bg-base-800 transition text-gray-600 dark:text-gray-300"
                  title="Close"
                >
                <X size={18} />
                </button>
            </div>
            </header>
            
            <div 
                className="p-4 overflow-auto relative flex-1 text-gray-800 dark:text-gray-200 select-none cursor-default" 
                ref={contentRef}
            >
                {renderContent()}
                
                {/* Desktop Floating Button */}
                {buttonPosition && selectedText && (
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setIsModalOpen(true)}
                        className="absolute flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-secondary rounded-lg shadow-lg animate-fade-in hover:bg-secondary/90 transition-transform hover:scale-105 z-20"
                        style={{ top: buttonPosition.top, left: buttonPosition.left, transform: 'translateX(-50%)' }}
                    >
                        <Sparkles size={14} className="mr-1.5" />
                        AI Explain
                    </button>
                )}
            </div>

            {/* Mobile Bottom Fixed Button */}
            {selectedText && (
               <div className="md:hidden absolute bottom-4 left-0 right-0 flex justify-center z-20 animate-fade-in px-4">
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-primary to-secondary rounded-full shadow-xl"
                  >
                    <Sparkles size={18} className="mr-2" />
                    Explain Selection with AI
                  </button>
               </div>
            )}

        </div>
        </div>
        {isModalOpen && (
            <AIExplanationModal 
                codeSnippet={selectedText}
                onClose={() => setIsModalOpen(false)}
            />
        )}
    </>
  );
};

export default FileViewer;
