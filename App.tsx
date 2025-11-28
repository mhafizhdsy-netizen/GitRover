
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
import LicensePage from './pages/LicensePage';
import BookmarksPage from './pages/BookmarksPage';
import { ThemeContext, ThemeMode, ThemeName } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ToastProvider } from './contexts/ToastContext';
import { BookmarkProvider } from './contexts/BookmarkContext';
import SettingsModal from './components/SettingsModal';
import { ToastContainer } from './components/common/Toast';
import BackToTop from './components/common/BackToTop';
import CookieConsent from './components/common/CookieConsent';
import ScrollToTop from './components/common/ScrollToTop'; 
import { themes } from './themes';
import { rgbStringToHex } from './utils/formatters';

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
      root.style.setProperty(`--color-base-${shade}`, value as string);
    });

    // 3. Update Favicon dynamically
    const primaryHex = rgbStringToHex(palette.primary);
    const secondaryHex = rgbStringToHex(palette.secondary);
    
    const svgIcon = `
      <svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
        <defs>
          <linearGradient id='icon-grad' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' style='stop-color:${primaryHex};stop-opacity:1' />
            <stop offset='100%' style='stop-color:${secondaryHex};stop-opacity:1' />
          </linearGradient>
          <filter id='glow'>
            <feGaussianBlur stdDeviation='2.5' result='coloredBlur'/>
            <feMerge>
              <feMergeNode in='coloredBlur'/>
              <feMergeNode in='SourceGraphic'/>
            </feMerge>
          </filter>
        </defs>
        <g fill='url(#icon-grad)' transform='translate(50 50)'>
          <g transform='rotate(30)'>
            <path d='M-23 -40 L23 -40 L46 0 L23 40 L-23 40 L-46 0 Z' fill-opacity='0.1'/>
            <path d='M0 0 L23 -40 L46 0 L23 40 Z' filter='url(#glow)' />
            <path d='M0 0 L-23 40 L-46 0 L-23 -40 Z' />
            <path d='M-23 -40 L-11.5 -20 L11.5 -20 L23 -40 Z' fill-opacity='0.5'/>
            <path d='M-23 40 L-11.5 20 L11.5 20 L23 40 Z' fill-opacity='0.5'/>
          </g>
        </g>
      </svg>
    `.trim();

    const encodedSvg = encodeURIComponent(svgIcon)
        .replace(/'/g, '%27')
        .replace(/"/g, '%22');
    
    // Completely remove existing favicons to force browser update
    const existingLinks = document.querySelectorAll("link[rel*='icon']");
    existingLinks.forEach(l => l.remove());

    // Create and append new favicon link
    const link = document.createElement('link');
    link.type = 'image/svg+xml';
    link.rel = 'icon';
    link.href = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
    document.head.appendChild(link);

    // 4. Persist choices to local storage
    try {
      localStorage.setItem('color_theme', themeName);
      localStorage.setItem('theme_mode', mode);
    } catch (e) {
      console.error('Could not access local storage', e instanceof Error ? e.message : String(e));
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
          <BookmarkProvider>
            <div className="min-h-screen text-gray-800 dark:text-base-200 bg-base-50 dark:bg-base-950 font-sans flex flex-col">
              <HashRouter>
                <ScrollToTop /> {/* Handle Global Scroll Restoration */}
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
                  <Route path="/bookmarks" element={<BookmarksPage />} />
                  <Route path="*" element={<ErrorPage />} />
                </Routes>
                <SettingsModal />
                <ToastContainer />
                <BackToTop />
                <CookieConsent />
              </HashRouter>
            </div>
          </BookmarkProvider>
        </SettingsProvider>
      </ToastProvider>
    </ThemeContext.Provider>
  );
}
