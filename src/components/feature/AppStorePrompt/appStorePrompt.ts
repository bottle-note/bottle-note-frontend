export const APP_STORE_URLS = {
  ios: 'https://apps.apple.com/kr/app/id6737512480',
  android:
    'https://play.google.com/store/apps/details?id=com.bottlenote.official.app',
} as const;

export const APP_STORE_PROMPT_DELAY_MS = 60_000;
export const APP_STORE_PROMPT_PREFERENCE_KEY = 'bn_app_store_prompt_preference';
export const APP_STORE_PROMPT_SESSION_KEY = 'bn_app_store_prompt_shown';

const DAY_MS = 24 * 60 * 60 * 1000;
const FIRST_DISMISSAL_COOLDOWN_MS = 7 * DAY_MS;
const REPEAT_DISMISSAL_COOLDOWN_MS = 30 * DAY_MS;
const STORE_CLICK_COOLDOWN_MS = 30 * DAY_MS;

export type MobileOperatingSystem = keyof typeof APP_STORE_URLS;

export interface AppStorePromptPreference {
  version: 1;
  dismissCount: number;
  nextEligibleAt: number | null;
  disabled: boolean;
}

const DEFAULT_PREFERENCE: AppStorePromptPreference = {
  version: 1,
  dismissCount: 0,
  nextEligibleAt: null,
  disabled: false,
};

const LIST_PATHS = new Set(['/explore', '/search', '/curation']);
const SEARCH_DETAIL_PATH = /^\/search\/[^/]+\/[^/]+(?:\/reviews)?$/;
const REVIEW_DETAIL_PATH = /^\/review\/(?!register$|modify$)[^/]+$/;
const CURATION_DETAIL_PATH = /^\/curation\/[^/]+$/;

const normalizePathname = (pathname: string) =>
  pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

export const isAppStorePromptRoute = (pathname: string): boolean => {
  const normalizedPathname = normalizePathname(pathname);

  return (
    LIST_PATHS.has(normalizedPathname) ||
    SEARCH_DETAIL_PATH.test(normalizedPathname) ||
    REVIEW_DETAIL_PATH.test(normalizedPathname) ||
    CURATION_DETAIL_PATH.test(normalizedPathname)
  );
};

interface NavigatorInfo {
  userAgent: string;
  platform?: string;
  maxTouchPoints?: number;
}

export const detectMobileOperatingSystem = ({
  userAgent,
  platform = '',
  maxTouchPoints = 0,
}: NavigatorInfo): MobileOperatingSystem | null => {
  if (/android/i.test(userAgent)) return 'android';

  const isAppleMobile = /iPad|iPhone|iPod/i.test(userAgent);
  const isIPadDesktopMode = platform === 'MacIntel' && maxTouchPoints > 1;

  return isAppleMobile || isIPadDesktopMode ? 'ios' : null;
};

const isPreference = (value: unknown): value is AppStorePromptPreference => {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<AppStorePromptPreference>;

  return (
    candidate.version === 1 &&
    typeof candidate.dismissCount === 'number' &&
    Number.isInteger(candidate.dismissCount) &&
    candidate.dismissCount >= 0 &&
    (candidate.nextEligibleAt === null ||
      (typeof candidate.nextEligibleAt === 'number' &&
        Number.isFinite(candidate.nextEligibleAt))) &&
    typeof candidate.disabled === 'boolean'
  );
};

export const readAppStorePromptPreference = (
  storage: Pick<Storage, 'getItem'>,
): AppStorePromptPreference => {
  try {
    const rawPreference = storage.getItem(APP_STORE_PROMPT_PREFERENCE_KEY);
    if (!rawPreference) return { ...DEFAULT_PREFERENCE };

    const parsedPreference: unknown = JSON.parse(rawPreference);
    return isPreference(parsedPreference)
      ? parsedPreference
      : { ...DEFAULT_PREFERENCE };
  } catch {
    return { ...DEFAULT_PREFERENCE };
  }
};

export const writeAppStorePromptPreference = (
  storage: Pick<Storage, 'setItem'>,
  preference: AppStorePromptPreference,
): void => {
  try {
    storage.setItem(
      APP_STORE_PROMPT_PREFERENCE_KEY,
      JSON.stringify(preference),
    );
  } catch {
    // Storage can be unavailable in restricted browser modes. Session gating still applies.
  }
};

export const canShowAppStorePrompt = (
  preference: AppStorePromptPreference,
  now: number,
): boolean =>
  !preference.disabled &&
  (preference.nextEligibleAt === null || preference.nextEligibleAt <= now);

export const createDismissedPreference = (
  currentPreference: AppStorePromptPreference,
  now: number,
): AppStorePromptPreference => {
  const dismissCount = currentPreference.dismissCount + 1;

  if (dismissCount >= 3) {
    return {
      version: 1,
      dismissCount,
      nextEligibleAt: null,
      disabled: true,
    };
  }

  const cooldown =
    dismissCount === 1
      ? FIRST_DISMISSAL_COOLDOWN_MS
      : REPEAT_DISMISSAL_COOLDOWN_MS;

  return {
    version: 1,
    dismissCount,
    nextEligibleAt: now + cooldown,
    disabled: false,
  };
};

export const createStoreClickedPreference = (
  currentPreference: AppStorePromptPreference,
  now: number,
): AppStorePromptPreference => ({
  ...currentPreference,
  nextEligibleAt: now + STORE_CLICK_COOLDOWN_MS,
});
