import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useMatch } from 'react-router-dom';
import { ThemeContext } from '../../contexts/ThemeContext';
import { Sun, Moon, Settings, ArrowLeft, Bookmark } from 'lucide-react';
import { GitRoverIcon } from '../../assets/icon';
import { useSettings } from '../../contexts/SettingsContext';

const Header: React.FC = () => {
  const themeContext = useContext(ThemeContext);
  const { openSettingsModal } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const onRepoPage = useMatch('/repo/:owner/:name/*');
  const onProfilePage = useMatch('/profile/:username');
  
  const isHeroPage = location.pathname === '/' || location.pathname === '/about';
  const headerPosition = isHeroPage ? 'fixed w-full' : 'sticky';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check on initial render

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (!themeContext) {
    return null;
  }

  const { mode, setMode } = themeContext;

  const toggleTheme = () => {
    setIsAnimating(true);
    setMode(mode === 'light' ? 'dark' : 'light');
    setTimeout(() => setIsAnimating(false), 500);
  };

  const showBackButton = location.pathname !== '/';
  const isLandingPage = location.pathname === '/';
  
  const staticPages = ['/', '/docs', '/roadmap', '/about', '/terms', '/license'];
  const showAppControls = !staticPages.includes(location.pathname);

  const handleBack = () => {
    if (onRepoPage || onProfilePage) {
      navigate('/search');
    } else if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/search', { replace: true });
    }
  };

  return (
    <>
      <header className={`
        ${headerPosition} top-0 z-40 transition-all duration-300 ease-in-out
        ${isScrolled 
          ? 'bg-base-50/80 dark:bg-base-950/80 backdrop-blur-lg border-b border-base-200 dark:border-base-800' 
          : 'bg-transparent border-b border-transparent'
        }
      `}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <button 
                  onClick={handleBack}
                  className="p-2 rounded-full hover:bg-base-200/50 dark:hover:bg-base-800/50 transition-colors text-gray-600 dark:text-gray-300"
                  aria-label="Go back"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <Link to="/" className="flex items-center space-x-2.5 text-xl font-bold text-gray-800 dark:text-gray-100 group">
                {isLandingPage && (
                  <GitRoverIcon className="w-8 h-8 group-hover:rotate-12 transition-transform duration-300" />
                )}
                <span className="hidden sm:inline font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                    GitRover
                </span>
              </Link>
              
              <nav className="hidden md:flex ml-6 space-x-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                <Link to="/docs" className="hover:text-primary transition-colors">Docs</Link>
                <Link to="/search" className="hover:text-primary transition-colors">Explore</Link>
                {showAppControls && (
                    <Link to="/bookmarks" className="hover:text-primary transition-colors flex items-center gap-1.5">
                        <Bookmark size={14} />
                        Bookmarks
                    </Link>
                )}
              </nav>
            </div>
            
            <div className="flex items-center space-x-2">
              {showAppControls && (
                  <Link 
                    to="/bookmarks" 
                    className="md:hidden p-2 rounded-full hover:bg-base-100/50 dark:hover:bg-base-800/50 transition-colors"
                    aria-label="Bookmarks"
                  >
                      <Bookmark size={20} />
                  </Link>
              )}

              {showAppControls && (
                <button
                  onClick={openSettingsModal}
                  className="p-2 rounded-full hover:bg-base-100/50 dark:hover:bg-base-800/50 transition-colors"
                  aria-label="Open settings"
                >
                  <Settings size={20} />
                </button>
              )}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full hover:bg-base-100/50 dark:hover:bg-base-800/50 transition-all duration-500 ease-in-out ${isAnimating ? 'rotate-[360deg]' : ''}`}
                aria-label="Toggle theme"
              >
                {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;