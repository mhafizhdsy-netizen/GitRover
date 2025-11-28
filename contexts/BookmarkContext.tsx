
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Repo, Gist } from '../types';
import { useToast } from './ToastContext';

interface BookmarkContextType {
  bookmarkedRepos: Repo[];
  bookmarkedGists: Gist[];
  addRepo: (repo: Repo) => void;
  removeRepo: (repoId: number) => void;
  isRepoBookmarked: (repoId: number) => boolean;
  addGist: (gist: Gist) => void;
  removeGist: (gistId: string) => void;
  isGistBookmarked: (gistId: string) => boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const BookmarkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addToast } = useToast();

  // --- Repositories ---
  const [bookmarkedRepos, setBookmarkedRepos] = useState<Repo[]>(() => {
    try {
      const stored = localStorage.getItem('gitrover_bookmarked_repos');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('gitrover_bookmarked_repos', JSON.stringify(bookmarkedRepos));
  }, [bookmarkedRepos]);

  const addRepo = (repo: Repo) => {
    if (!bookmarkedRepos.some(r => r.id === repo.id)) {
      setBookmarkedRepos(prev => [repo, ...prev]);
      addToast('Repository added to bookmarks', 'success');
    }
  };

  const removeRepo = (repoId: number) => {
    setBookmarkedRepos(prev => prev.filter(r => r.id !== repoId));
    addToast('Repository removed from bookmarks', 'info');
  };

  const isRepoBookmarked = (repoId: number) => {
    return bookmarkedRepos.some(r => r.id === repoId);
  };

  // --- Gists ---
  const [bookmarkedGists, setBookmarkedGists] = useState<Gist[]>(() => {
    try {
      const stored = localStorage.getItem('gitrover_bookmarked_gists');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('gitrover_bookmarked_gists', JSON.stringify(bookmarkedGists));
  }, [bookmarkedGists]);

  const addGist = (gist: Gist) => {
    if (!bookmarkedGists.some(g => g.id === gist.id)) {
      setBookmarkedGists(prev => [gist, ...prev]);
      addToast('Gist added to bookmarks', 'success');
    }
  };

  const removeGist = (gistId: string) => {
    setBookmarkedGists(prev => prev.filter(g => g.id !== gistId));
    addToast('Gist removed from bookmarks', 'info');
  };

  const isGistBookmarked = (gistId: string) => {
    return bookmarkedGists.some(g => g.id === gistId);
  };

  return (
    <BookmarkContext.Provider value={{
      bookmarkedRepos,
      bookmarkedGists,
      addRepo,
      removeRepo,
      isRepoBookmarked,
      addGist,
      removeGist,
      isGistBookmarked
    }}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = (): BookmarkContextType => {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};
