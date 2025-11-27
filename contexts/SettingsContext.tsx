import React, { createContext, useState, useCallback, useContext, ReactNode, useMemo } from 'react';
import { ThemeContext } from './ThemeContext';

// Import Syntax Highlighting Themes
import { 
  vscDarkPlus, 
  vs, 
  dracula, 
  atomDark, 
  ghcolors, 
  materialDark, 
  solarizedlight, // Corrected from solarizedLight
  nord,
  tomorrow
} from 'react-syntax-highlighter/dist/esm/styles/prism';

export const SYNTAX_THEMES = {
  'auto': { name: 'Auto (System Default)', style: null }, // Special case
  'vsc-dark': { name: 'VS Code Dark', style: vscDarkPlus },
  'vs-light': { name: 'VS Code Light', style: vs },
  'dracula': { name: 'Dracula', style: dracula },
  'atom-dark': { name: 'Atom One Dark', style: atomDark },
  'github-light': { name: 'GitHub Light', style: ghcolors },
  'material-dark': { name: 'Material Dark', style: materialDark },
  'solarized-light': { name: 'Solarized Light', style: solarizedlight }, // Updated usage
  'nord': { name: 'Nord', style: nord },
  'tomorrow': { name: 'Tomorrow', style: tomorrow },
};

export type SyntaxThemeKey = keyof typeof SYNTAX_THEMES;

interface SettingsContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  isSettingsOpen: boolean;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  // New Syntax Theme Properties
  syntaxThemeKey: SyntaxThemeKey;
  setSyntaxThemeKey: (key: SyntaxThemeKey) => void;
  activeSyntaxTheme: any; // The actual style object to pass to SyntaxHighlighter
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const themeContext = useContext(ThemeContext);
  
  // --- Token Logic ---
  const [token, setTokenState] = useState<string | null>(() => {
    try {
      return localStorage.getItem('github_pat');
    } catch (e) {
      return null;
    }
  });

  const setToken = useCallback((newToken: string | null) => {
    setTokenState(newToken);
    try {
      if (newToken) {
        localStorage.setItem('github_pat', newToken);
      } else {
        localStorage.removeItem('github_pat');
      }
    } catch (e) {
      console.error('Could not access local storage', String(e));
    }
  }, []);

  // --- Syntax Theme Logic ---
  const [syntaxThemeKey, setSyntaxThemeKeyState] = useState<SyntaxThemeKey>(() => {
    try {
      return (localStorage.getItem('syntax_theme') as SyntaxThemeKey) || 'auto';
    } catch {
      return 'auto';
    }
  });

  const setSyntaxThemeKey = useCallback((key: SyntaxThemeKey) => {
    setSyntaxThemeKeyState(key);
    try {
      localStorage.setItem('syntax_theme', key);
    } catch (e) {
      console.error('Could not access local storage', String(e));
    }
  }, []);

  // Calculate the actual style object based on selection and current app mode
  const activeSyntaxTheme = useMemo(() => {
    if (syntaxThemeKey === 'auto' || !SYNTAX_THEMES[syntaxThemeKey]) {
      // Default behavior: VS Dark for Dark mode, VS Light for Light mode
      return themeContext?.mode === 'dark' ? vscDarkPlus : vs;
    }
    return SYNTAX_THEMES[syntaxThemeKey].style;
  }, [syntaxThemeKey, themeContext?.mode]);

  // --- Modal Logic ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const openSettingsModal = useCallback(() => setIsSettingsOpen(true), []);
  const closeSettingsModal = useCallback(() => setIsSettingsOpen(false), []);
  
  return (
    <SettingsContext.Provider value={{ 
      token, 
      setToken, 
      isSettingsOpen, 
      openSettingsModal, 
      closeSettingsModal,
      syntaxThemeKey,
      setSyntaxThemeKey,
      activeSyntaxTheme
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};