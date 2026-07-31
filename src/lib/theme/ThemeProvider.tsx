'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  applyThemePreference,
  getStoredThemePreference,
  resolveTheme,
  saveThemePreference,
  THEME_MEDIA_QUERY,
  ThemePreference,
  ResolvedTheme,
} from './theme';

interface ThemeContextValue {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  isInitialized: boolean;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  const applyPreference = useCallback((nextPreference: ThemePreference) => {
    setResolvedTheme(applyThemePreference(nextPreference));
  }, []);

  useEffect(() => {
    const storedPreference = getStoredThemePreference();

    setPreferenceState(storedPreference);
    applyPreference(storedPreference);
    setIsInitialized(true);
  }, [applyPreference]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(THEME_MEDIA_QUERY);
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      if (preference !== 'system') return;

      const nextTheme = resolveTheme('system', event.matches);
      document.documentElement.classList.toggle('dark', nextTheme === 'dark');
      document.documentElement.style.colorScheme = nextTheme;
      setResolvedTheme(nextTheme);
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [preference]);

  const setPreference = useCallback(
    (nextPreference: ThemePreference) => {
      saveThemePreference(nextPreference);
      setPreferenceState(nextPreference);
      applyPreference(nextPreference);
    },
    [applyPreference],
  );

  const contextValue = useMemo(
    () => ({
      preference,
      resolvedTheme,
      isInitialized,
      setPreference,
    }),
    [isInitialized, preference, resolvedTheme, setPreference],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
