
import React, { useState, useEffect, useContext, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, KeyRound, Check, ExternalLink, Palette, Code, ChevronDown, HelpCircle } from 'lucide-react';
import { useSettings, SYNTAX_THEMES, SyntaxThemeKey } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { ThemeContext, ThemeName } from '../contexts/ThemeContext';
import { themes } from '../themes';

const SettingsModal: React.FC = () => {
  const { 
    token, 
    setToken, 
    isSettingsOpen, 
    closeSettingsModal,
    syntaxThemeKey,
    setSyntaxThemeKey
  } = useSettings();
  
  const themeContext = useContext(ThemeContext);
  if (!themeContext) return null;
  const { themeName, setThemeName } = themeContext;
  
  const { addToast } = useToast();

  const [localToken, setLocalToken] = useState(token || '');
  const [localSyntaxThemeKey, setLocalSyntaxThemeKey] = useState<SyntaxThemeKey>(syntaxThemeKey);
  const [localThemeName, setLocalThemeName] = useState<ThemeName>(themeName);
  const [saved, setSaved] = useState(false);
  
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isSyntaxDropdownOpen, setIsSyntaxDropdownOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  
  const themeButtonRef = useRef<HTMLButtonElement>(null);
  const syntaxButtonRef = useRef<HTMLButtonElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const syntaxDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSettingsOpen) {
      setLocalToken(token || '');
      setLocalSyntaxThemeKey(syntaxThemeKey);
      setLocalThemeName(themeName);
      setSaved(false);
      setIsThemeDropdownOpen(false);
      setIsSyntaxDropdownOpen(false);
    }
  }, [isSettingsOpen, token, syntaxThemeKey, themeName]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isThemeDropdownOpen &&
        themeButtonRef.current && !themeButtonRef.current.contains(event.target as Node) &&
        themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsThemeDropdownOpen(false);
      }
      if (
        isSyntaxDropdownOpen &&
        syntaxButtonRef.current && !syntaxButtonRef.current.contains(event.target as Node) &&
        syntaxDropdownRef.current && !syntaxDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSyntaxDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isThemeDropdownOpen, isSyntaxDropdownOpen]);

  const handleSave = () => {
    const trimmedToken = localToken.trim();
    
    try {
      setToken(trimmedToken || null);
      setSyntaxThemeKey(localSyntaxThemeKey);
      setThemeName(localThemeName);
      
      setSaved(true);
      addToast('Settings saved successfully', 'success');
      
      if (trimmedToken !== (token || '')) {
        setTimeout(() => window.location.reload(), 800);
      } else {
        setTimeout(() => closeSettingsModal(), 800);
      }

    } catch (e) {
      console.error('Failed to save settings:', e);
      addToast('Failed to save settings', 'error');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
  };
  
  const calculateDropdownPosition = (buttonRef: React.RefObject<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const dropdownHeight = 240; // Corresponds to max-h-60 (15rem)

    const style: React.CSSProperties = {
      position: 'fixed',
      left: `${buttonRect.left}px`,
      width: `${buttonRect.width}px`,
      zIndex: 60, // Higher than modal overlay's z-50
    };

    if (spaceBelow >= dropdownHeight || spaceBelow > buttonRect.top) {
      // Prefer to open downwards
      style.top = `${buttonRect.bottom + 4}px`;
    } else {
      // Open upwards
      style.bottom = `${window.innerHeight - buttonRect.top + 4}px`;
    }
    setDropdownStyle(style);
  };
  
  const handleToggleThemeDropdown = () => {
    if (!isThemeDropdownOpen) {
      calculateDropdownPosition(themeButtonRef);
    }
    setIsThemeDropdownOpen(prev => !prev);
    setIsSyntaxDropdownOpen(false);
  };

  const handleToggleSyntaxDropdown = () => {
    if (!isSyntaxDropdownOpen) {
      calculateDropdownPosition(syntaxButtonRef);
    }
    setIsSyntaxDropdownOpen(prev => !prev);
    setIsThemeDropdownOpen(false);
  };

  const handleThemeSelect = (key: ThemeName) => {
      setLocalThemeName(key);
      setIsThemeDropdownOpen(false);
  }

  const handleSyntaxSelect = (key: SyntaxThemeKey) => {
      setLocalSyntaxThemeKey(key);
      setIsSyntaxDropdownOpen(false);
  }

  if (!isSettingsOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={closeSettingsModal}>
        <div 
          className="bg-white dark:bg-base-900 rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90dvh] overflow-hidden animate-fade-in" 
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex items-center justify-between p-5 border-b border-base-200 dark:border-base-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h2>
            <button onClick={closeSettingsModal} className="p-2 -m-2 rounded-full hover:bg-base-100 dark:hover:bg-base-800 transition text-gray-500 dark:text-gray-400">
              <X size={20} />
            </button>
          </header>
          
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Token Section */}
            <div>
              <label htmlFor="github-token" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-base-200">
                GitHub Personal Access Token
              </label>
              <div className="relative">
                <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="github-token"
                  type="password"
                  value={localToken}
                  onChange={(e) => setLocalToken(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="ghp_..."
                  className="w-full pl-10 pr-4 py-2 border border-base-300 dark:border-base-700 rounded-lg bg-transparent focus:ring-2 focus:ring-primary focus:outline-none transition text-gray-800 dark:text-gray-100 placeholder-gray-400"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-base-400 mt-2">
                Increases API rate limit from 60 to 5,000 reqs/hr.
              </p>
              
              <div className="flex flex-col gap-2 mt-3">
                  <a 
                    href="https://github.com/settings/tokens/new?scopes=public_repo&description=GitRover" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center text-sm text-primary hover:underline"
                  >
                    Generate token on GitHub <ExternalLink size={14} className="ml-1" />
                  </a>
                  
                  <Link 
                    to="/docs#how-to-create-pat" 
                    onClick={closeSettingsModal}
                    className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                  >
                    <HelpCircle size={14} className="mr-1.5" />
                    How to create a Personal Access Token?
                  </Link>
              </div>
            </div>

            <div className="border-t border-base-200 dark:border-base-800"></div>

            {/* Color Theme Section */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-base-200 flex items-center">
                <Palette size={16} className="mr-2 text-gray-500" />
                Color Theme
              </h3>
              <button
                ref={themeButtonRef}
                onClick={handleToggleThemeDropdown}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-base-300 dark:border-base-700 bg-white dark:bg-base-800 hover:border-primary/50 dark:hover:border-primary/50 transition-colors"
                aria-haspopup="true"
                aria-expanded={isThemeDropdownOpen}
              >
                <div className="flex items-center">
                  <div className="flex items-center -space-x-1 mr-3">
                      <div className="w-4 h-4 rounded-full border-2 border-white dark:border-base-800" style={{ backgroundColor: `rgb(${themes[localThemeName].light.primary})` }}></div>
                      <div className="w-4 h-4 rounded-full border-2 border-white dark:border-base-800" style={{ backgroundColor: `rgb(${themes[localThemeName].light.secondary})` }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-base-200">{themes[localThemeName].name}</span>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isThemeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            <div className="border-t border-base-200 dark:border-base-800"></div>

            {/* Syntax Theme Section */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-base-200 flex items-center">
                <Code size={16} className="mr-2 text-gray-500" />
                Code Syntax Highlighting
              </h3>
              <button
                ref={syntaxButtonRef}
                onClick={handleToggleSyntaxDropdown}
                className="w-full flex items-center justify-between px-4 py-3 text-sm rounded-lg border border-base-300 dark:border-base-700 bg-white dark:bg-base-800 hover:border-primary/50 dark:hover:border-primary/50 transition-colors"
                aria-haspopup="true"
                aria-expanded={isSyntaxDropdownOpen}
              >
                <span className="font-medium text-gray-800 dark:text-base-200">{SYNTAX_THEMES[localSyntaxThemeKey].name}</span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isSyntaxDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
               <p className="text-xs text-gray-500 dark:text-base-400 mt-2">
                Select your preferred color scheme for code blocks.
              </p>
            </div>
          </div>

          <footer className="px-6 py-4 bg-base-50 dark:bg-base-950/50 border-t border-base-200 dark:border-base-800 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saved}
                className={`px-5 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center min-w-[120px]
                  ${saved 
                    ? 'bg-green-500 text-white cursor-default transform scale-105' 
                    : 'bg-primary text-white hover:bg-primary/90 hover:shadow-md'
                  }`}
              >
                {saved ? (
                  <>
                    <Check size={18} className="mr-2" /> Saved
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
          </footer>
        </div>
      </div>
      
      {isThemeDropdownOpen && createPortal(
        <div 
          ref={themeDropdownRef} 
          style={dropdownStyle}
          className="bg-white dark:bg-base-900 rounded-lg shadow-xl border border-base-200 dark:border-base-700 p-2 animate-fade-in max-h-60 overflow-y-auto"
        >
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => handleThemeSelect(key as ThemeName)}
              className={`w-full text-left p-3 rounded-md transition-colors flex items-center justify-between ${localThemeName === key ? 'bg-primary/10' : 'hover:bg-base-100 dark:hover:bg-base-800'}`}
            >
              <span className="text-sm font-medium text-gray-800 dark:text-base-200">{theme.name}</span>
              <div className="flex items-center -space-x-1">
                  <div className="w-4 h-4 rounded-full border-2 border-white dark:border-base-800" style={{ backgroundColor: `rgb(${theme.light.primary})` }}></div>
                  <div className="w-4 h-4 rounded-full border-2 border-white dark:border-base-800" style={{ backgroundColor: `rgb(${theme.light.secondary})` }}></div>
              </div>
            </button>
          ))}
        </div>,
        document.getElementById('portal-root')!
      )}

      {isSyntaxDropdownOpen && createPortal(
        <div 
          ref={syntaxDropdownRef} 
          style={dropdownStyle}
          className="bg-white dark:bg-base-900 rounded-lg shadow-xl border border-base-200 dark:border-base-700 p-2 animate-fade-in max-h-60 overflow-y-auto"
        >
          {Object.entries(SYNTAX_THEMES).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleSyntaxSelect(key as SyntaxThemeKey)}
              className={`w-full text-left flex items-center justify-between px-4 py-3 text-sm rounded-md transition-colors ${localSyntaxThemeKey === key ? 'bg-primary/10' : 'hover:bg-base-100 dark:hover:bg-base-800'}`}
            >
              <span className="font-medium text-gray-800 dark:text-base-200">{value.name}</span>
              {localSyntaxThemeKey === key && <Check size={14} className="text-primary" />}
            </button>
          ))}
        </div>,
        document.getElementById('portal-root')!
      )}
    </>
  );
};

export default SettingsModal;
