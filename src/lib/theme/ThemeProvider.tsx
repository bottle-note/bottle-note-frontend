'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type Theme = 'light' | 'dark';
export type ThemePreference = Theme | 'system';

interface ThemeContextValue {
  preference: ThemePreference;
  theme: Theme;
  isDarkMode: boolean;
  setThemePreference: (preference: ThemePreference) => void;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export const THEME_STORAGE_KEY = 'bottle-note-theme';
export const DARK_MODE_MEDIA_QUERY = '(prefers-color-scheme: dark)';

const ThemeContext = createContext<ThemeContextValue | null>(null);

const isThemePreference = (value: string | null): value is ThemePreference =>
  value === 'light' || value === 'dark' || value === 'system';

const readThemePreference = (): ThemePreference => {
  try {
    const storedPreference = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(storedPreference) ? storedPreference : 'system';
  } catch {
    return 'system';
  }
};

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [systemTheme, setSystemTheme] = useState<Theme>('light');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setPreference(readThemePreference());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || preference !== 'system' || !window.matchMedia) {
      return undefined;
    }

    const mediaQuery = window.matchMedia(DARK_MODE_MEDIA_QUERY);
    const syncSystemTheme = (event?: MediaQueryListEvent) => {
      setSystemTheme(event?.matches ?? mediaQuery.matches ? 'dark' : 'light');
    };

    syncSystemTheme();
    mediaQuery.addEventListener('change', syncSystemTheme);

    return () => mediaQuery.removeEventListener('change', syncSystemTheme);
  }, [isReady, preference]);

  const theme = preference === 'system' ? systemTheme : preference;

  useEffect(() => {
    if (isReady) applyTheme(theme);
  }, [isReady, theme]);

  const setThemePreference = useCallback((nextPreference: ThemePreference) => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextPreference);
    } catch {
      // Storage can be disabled in private or embedded browser contexts.
    }

    setPreference(nextPreference);
  }, []);

  const value = useMemo(
    () => ({
      preference,
      theme,
      isDarkMode: theme === 'dark',
      setThemePreference,
    }),
    [preference, setThemePreference, theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
};
