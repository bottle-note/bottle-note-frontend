'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import AppStorePromptBanner from './AppStorePromptBanner';
import {
  APP_STORE_PROMPT_SESSION_KEY,
  APP_STORE_PROMPT_VIEW_THRESHOLD,
  APP_STORE_URLS,
  canShowAppStorePrompt,
  createDismissedPreference,
  createStoreClickedPreference,
  detectMobileOperatingSystem,
  incrementAppStorePromptDetailViewCount,
  isAppStorePromptDetailRoute,
  readAppStorePromptPreference,
  writeAppStorePromptPreference,
  type MobileOperatingSystem,
} from './appStorePrompt';

const browserStorage = {
  getItem: (key: string) => window.localStorage.getItem(key),
  setItem: (key: string, value: string) =>
    window.localStorage.setItem(key, value),
};

function AppStorePrompt() {
  const pathname = usePathname();
  const { isLoggedIn, isLoading: isAuthLoading } = useAuthSession();
  const [mobileOperatingSystem, setMobileOperatingSystem] =
    useState<MobileOperatingSystem | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasShownInSession, setHasShownInSession] = useState(false);
  const countedPathnameRef = useRef<string | null>(null);
  const detailViewCountRef = useRef(0);

  useEffect(() => {
    setMobileOperatingSystem(
      detectMobileOperatingSystem({
        userAgent: window.navigator.userAgent,
        platform: window.navigator.platform,
        maxTouchPoints: window.navigator.maxTouchPoints,
      }),
    );

    try {
      setHasShownInSession(
        sessionStorage.getItem(APP_STORE_PROMPT_SESSION_KEY) === 'true',
      );
    } catch {
      setHasShownInSession(false);
    }

    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized || isAuthLoading) return;

    if (!isLoggedIn || !mobileOperatingSystem || window.isInApp === true) {
      setIsOpen(false);
      return;
    }

    if (countedPathnameRef.current === pathname) return;
    countedPathnameRef.current = pathname;

    if (!isAppStorePromptDetailRoute(pathname)) {
      setIsOpen(false);
      return;
    }

    if (hasShownInSession) return;

    const now = Date.now();
    const preference = readAppStorePromptPreference(browserStorage);
    if (!canShowAppStorePrompt(preference, now)) return;

    const detailViewCount = incrementAppStorePromptDetailViewCount(
      browserStorage,
      detailViewCountRef.current,
    );
    detailViewCountRef.current = detailViewCount;

    if (detailViewCount < APP_STORE_PROMPT_VIEW_THRESHOLD) return;

    try {
      sessionStorage.setItem(APP_STORE_PROMPT_SESSION_KEY, 'true');
    } catch {
      // Local state still prevents duplicate prompts in this mounted session.
    }

    setHasShownInSession(true);
    setIsOpen(true);
  }, [
    hasShownInSession,
    isAuthLoading,
    isInitialized,
    isLoggedIn,
    mobileOperatingSystem,
    pathname,
  ]);

  if (
    !isLoggedIn ||
    !isOpen ||
    !mobileOperatingSystem ||
    !isAppStorePromptDetailRoute(pathname)
  ) {
    return null;
  }

  const handleClose = () => {
    const currentPreference = readAppStorePromptPreference(browserStorage);
    writeAppStorePromptPreference(
      browserStorage,
      createDismissedPreference(currentPreference, Date.now()),
    );
    setIsOpen(false);
  };

  const handleStoreClick = () => {
    const currentPreference = readAppStorePromptPreference(browserStorage);
    writeAppStorePromptPreference(
      browserStorage,
      createStoreClickedPreference(currentPreference, Date.now()),
    );
    setIsOpen(false);
    window.location.assign(APP_STORE_URLS[mobileOperatingSystem]);
  };

  return (
    <AppStorePromptBanner onAction={handleStoreClick} onClose={handleClose} />
  );
}

export default AppStorePrompt;
