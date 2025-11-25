
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import RepoDetailPage from './pages/RepoDetailPage';
import ProfilePage from './pages/ProfilePage';
import ErrorPage from './pages/ErrorPage';
import TermsPage from './pages/TermsPage';
import AboutPage from './pages/AboutPage';
import DocsPage from './pages/DocsPage';
import RoadmapPage from './pages/RoadmapPage';
import LicensePage from './pages/LicensePage'; // Import halaman lisensi baru
import { ThemeContext, ThemeMode, ThemeName } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ToastProvider } from './contexts/ToastContext';
import SettingsModal from './components/SettingsModal';
import { ToastContainer } from './components/common/Toast';
import BackToTop from './components/common/BackToTop';
import CookieConsent from './components/common/CookieConsent';
import { themes } from './themes';

export default function App() {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    try {
      return (localStorage.getItem('color_theme') as ThemeName) || 'default';
    } catch (e) {
      return 'default';
    }
  });

  const [mode, setMode] = useState<ThemeMode>(() => {
    try {
      const storedMode = window.localStorage.getItem('theme_mode') as ThemeMode | null;
      if (storedMode) {
        return storedMode;
      }
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {
      //
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // 1. Apply .dark class for Tailwind's dark mode selectors
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // 2. Apply theme colors as CSS variables
    const selectedTheme = themes[themeName] || themes.default;
    const palette = selectedTheme[mode];
    
    root.style.setProperty('--color-primary', palette.primary);
    root.style.setProperty('--color-secondary', palette.secondary);
    
    Object.entries(palette.base).forEach(([shade, value]) => {
      root.style.setProperty(`--color-base-${shade}`, value);
    });

    // 3. Persist choices to local storage
    try {
      localStorage.setItem('color_theme', themeName);
      localStorage.setItem('theme_mode', mode);
    } catch (e) {
      // FIX: The error object `e` is of type 'unknown' and must be cast to a string to be logged.
      // FIX: Argument of type 'unknown' is not assignable to parameter of type 'string'. Cast 'e' to string.
      console.error('Could not access local storage', String(e));
    }
  }, [themeName, mode]);

  const themeValue = useMemo(() => ({
    themeName,
    setThemeName: (name: ThemeName) => setThemeName(name),
    mode,
    setMode
  }), [themeName, mode]);

  return (
    <ThemeContext.Provider value={themeValue}>
      <ToastProvider>
        <SettingsProvider>
          <div className="min-h-screen text-gray-800 dark:text-base-200 bg-base-50 dark:bg-base-950 font-sans flex flex-col">
            <HashRouter>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/search" element={<HomePage />} />
                <Route path="/repo/:owner/:name/*" element={<RepoDetailPage />} />
                <Route path="/profile/:username" element={<ProfilePage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/docs" element={<DocsPage />} />
                <Route path="/roadmap" element={<RoadmapPage />} />
                <Route path="/license" element={<LicensePage />} /> 
                <Route path="*" element={<ErrorPage />} />
              </Routes>
              <SettingsModal />
              <ToastContainer />
              <BackToTop />
              <CookieConsent />
            </HashRouter>
          </div>
        </SettingsProvider>
      </ToastProvider>
    </ThemeContext.Provider>
  );
}
