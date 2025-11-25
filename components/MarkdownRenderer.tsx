
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Copy, Check } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';

interface MarkdownRendererProps {
  content: string;
  owner?: string;
  repoName?: string;
  branch?: string;
  filePath?: string;
}

const CodeBlock: React.FC<{ className?: string, children: React.ReactNode[] | React.ReactNode }> = ({ className, children }) => {
  const { activeSyntaxTheme } = useSettings();
  const { addToast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const lang = /language-(\w+)/.exec(className || '')?.[1] || 'text';
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString).then(() => {
      setCopied(true);
      addToast('Code copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="my-4 relative group rounded-md overflow-hidden bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#eff1f3] dark:bg-[#21262d] border-b border-[#d0d7de] dark:border-[#30363d] text-xs font-mono text-gray-600 dark:text-gray-300 select-none">
        <span className="font-bold">{lang}</span>
      </div>
      
      <SyntaxHighlighter
          style={activeSyntaxTheme}
          language={lang}
          PreTag="div"
          customStyle={{ 
            margin: 0, 
            padding: '16px', 
            paddingBottom: '40px', // Extra padding to prevent button overlap
            background: 'transparent', // Ensure text has no background so container bg shows
            fontSize: '85%',
            lineHeight: '1.45',
          }}
          codeTagProps={{ 
            style: { 
                fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
                background: 'transparent', // Ensure code tag has no background
            } 
          }}
      >
          {codeString}
      </SyntaxHighlighter>

      <button
        onClick={handleCopy}
        className="absolute bottom-2 right-2 z-10 p-2 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm backdrop-blur-sm"
        aria-label="Copy code"
        title="Copy code"
      >
        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
      </button>
    </div>
  );
};


const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, owner, repoName, branch, filePath }) => {

  const resolveUrl = (uri: string, type: 'image' | 'link') => {
    if (!uri) return '';
    
    // 1. Handle Absolute URLs
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
        if (type === 'image') {
             // Fix GitHub Blob URLs -> Raw to ensure images render
             // Pattern: https://github.com/user/repo/blob/branch/path/to/image.png
             // Target: https://raw.githubusercontent.com/user/repo/branch/path/to/image.png
             const githubBlobPattern = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/;
             const match = uri.match(githubBlobPattern);
             if (match) {
                 const [_, uOwner, uRepo, uBranch, uPath] = match;
                 return `https://raw.githubusercontent.com/${uOwner}/${uRepo}/${uBranch}/${uPath}`;
             }
        }
        return uri;
    }
    
    if (uri.startsWith('data:') || uri.startsWith('mailto:') || uri.startsWith('tel:')) return uri;
    if (uri.startsWith('#')) return uri;

    // 2. Handle Protocol Relative
    if (uri.startsWith('//')) {
      return `https:${uri}`;
    }

    // 3. Handle Relative Paths
    // If we don't have enough context, return original to attempt best-effort
    if (!owner || !repoName || !branch) return uri;

    const currentPath = filePath || '';
    const pathDir = currentPath.includes('/') ? currentPath.substring(0, currentPath.lastIndexOf('/') + 1) : '';

    try {
        const dummyOrigin = 'https://dummy.base';
        const dummyBase = `${dummyOrigin}/${pathDir}`;
        const resolvedUrl = new URL(uri, dummyBase);
        const resolvedPath = resolvedUrl.pathname.substring(1); // remove leading slash

        if (type === 'image') {
             return `https://raw.githubusercontent.com/${owner}/${repoName}/${branch}/${resolvedPath}`;
        } else {
             return `#/repo/${owner}/${repoName}/blob/${branch}/${resolvedPath}`;
        }
    } catch (e) {
        console.error(`Could not resolve URI: ${uri}`, e);
        return uri;
    }
  };

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ node, inline, className, children, ...props }) {
            if (inline) {
              return <code className={className} {...props}>{children}</code>;
            }
            return <CodeBlock className={className}>{children}</CodeBlock>;
          },
          img: ({node, src, ...props}) => (
            <img 
                className="max-w-full" 
                src={resolveUrl(src || '', 'image')} 
                {...props} 
            />
          ),
          a: ({node, href, ...props}) => (
            <a 
                href={resolveUrl(href || '', 'link')}
                rel={!href?.startsWith('#') ? "noopener noreferrer" : undefined}
                target={!href?.startsWith('#') ? "_blank" : "_self"}
                {...props} 
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
