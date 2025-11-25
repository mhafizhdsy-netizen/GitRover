
import { createContext, Dispatch, SetStateAction } from 'react';
import { themes } from '../themes';

export type ThemeMode = 'light' | 'dark';
export type ThemeName = keyof typeof themes;

export interface ThemeContextType {
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
  mode: ThemeMode;
  setMode: Dispatch<SetStateAction<ThemeMode>>;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);