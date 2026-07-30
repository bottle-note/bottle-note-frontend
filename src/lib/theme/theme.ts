export const THEME_STORAGE_KEY = 'bottle-note-theme';
export const THEME_MEDIA_QUERY = '(prefers-color-scheme: dark)';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = Exclude<ThemePreference, 'system'>;

export const isThemePreference = (
  value: string | null,
): value is ThemePreference =>
  value === 'system' || value === 'light' || value === 'dark';

export const resolveTheme = (
  preference: ThemePreference,
  systemPrefersDark: boolean,
): ResolvedTheme => {
  if (preference === 'system') {
    return systemPrefersDark ? 'dark' : 'light';
  }

  return preference;
};

export const getStoredThemePreference = (): ThemePreference => {
  if (typeof window === 'undefined') return 'system';

  try {
    const storedPreference = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(storedPreference) ? storedPreference : 'system';
  } catch {
    return 'system';
  }
};

export const saveThemePreference = (preference: ThemePreference) => {
  if (typeof window === 'undefined') return;

  try {
    if (preference === 'system') {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // 저장소 접근이 제한된 환경에서도 현재 세션의 테마 전환은 유지한다.
  }
};

export const applyThemePreference = (
  preference: ThemePreference,
): ResolvedTheme => {
  const systemPrefersDark = window.matchMedia(THEME_MEDIA_QUERY).matches;
  const resolvedTheme = resolveTheme(preference, systemPrefersDark);

  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  document.documentElement.style.colorScheme = resolvedTheme;

  return resolvedTheme;
};

export const THEME_INITIALIZER_SCRIPT = `
  (() => {
    const storageKey = ${JSON.stringify(THEME_STORAGE_KEY)};
    const mediaQuery = ${JSON.stringify(THEME_MEDIA_QUERY)};
    const root = document.documentElement;

    const apply = (preference) => {
      const followsSystem = preference !== 'light' && preference !== 'dark';
      const resolvedTheme = followsSystem
        ? (window.matchMedia(mediaQuery).matches ? 'dark' : 'light')
        : preference;

      root.classList.toggle('dark', resolvedTheme === 'dark');
      root.style.colorScheme = resolvedTheme;
    };

    try {
      apply(window.localStorage.getItem(storageKey));
    } catch {
      apply('system');
    }
  })();
`;
