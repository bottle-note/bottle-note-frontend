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

interface ThemeContextValue {
  theme: Theme;
  isDarkMode: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = 'bottle-note-theme';
const DARK_MODE_MEDIA_QUERY = '(prefers-color-scheme: dark)';

const ThemeContext = createContext<ThemeContextValue | null>(null);

const getSystemTheme = (): Theme =>
  window.matchMedia?.(DARK_MODE_MEDIA_QUERY).matches ? 'dark' : 'light';

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (storedTheme === 'light' || storedTheme === 'dark') {
      setThemeState(storedTheme);
      return;
    }

    setThemeState(getSystemTheme());
  }, []);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((currentTheme) => {
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      return nextTheme;
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDarkMode: theme === 'dark',
      setTheme,
      toggleTheme,
    }),
    [setTheme, theme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <div className={theme === 'dark' ? 'dark' : undefined} data-theme={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
};
