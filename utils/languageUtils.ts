
export const getLanguageFromFilename = (filename: string): string => {
  const lowerName = filename.toLowerCase();
  
  // Specific filenames
  if (lowerName === 'dockerfile') return 'docker';
  if (lowerName === 'makefile') return 'makefile';
  if (lowerName === 'jenkinsfile') return 'groovy';
  if (lowerName === 'gemfile') return 'ruby';
  if (lowerName === 'package.json') return 'json';
  if (lowerName === 'tsconfig.json') return 'json';

  const ext = filename.split('.').pop()?.toLowerCase() || '';

  // Map extensions to Prism language keys
  const languageMap: { [key: string]: string } = {
    'js': 'javascript',
    'jsx': 'jsx',
    'ts': 'typescript',
    'tsx': 'tsx',
    'py': 'python',
    'rb': 'ruby',
    'java': 'java',
    'go': 'go',
    'c': 'c',
    'cpp': 'cpp',
    'h': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'json': 'json',
    'xml': 'xml',
    'svg': 'xml',
    'yml': 'yaml',
    'yaml': 'yaml',
    'md': 'markdown',
    'sh': 'bash',
    'bash': 'bash',
    'zsh': 'bash',
    'sql': 'sql',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'kts': 'kotlin',
    'r': 'r',
    'pl': 'perl',
    'lua': 'lua',
    'vb': 'visual-basic',
    'ps1': 'powershell',
    'dockerfile': 'docker',
    'tf': 'hcl',
    'toml': 'toml',
    'ini': 'ini',
    'graphql': 'graphql',
    'gql': 'graphql',
  };

  return languageMap[ext] || 'text';
};
