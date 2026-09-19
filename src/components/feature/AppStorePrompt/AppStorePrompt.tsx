'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import PromptModal from '@/components/ui/Modal/PromptModal';
import useModalStore from '@/store/modalStore';
import {
  APP_STORE_PROMPT_DELAY_MS,
  APP_STORE_PROMPT_SESSION_KEY,
  APP_STORE_URLS,
  canShowAppStorePrompt,
  createDismissedPreference,
  createStoreClickedPreference,
  detectMobileOperatingSystem,
  isAppStorePromptRoute,
  readAppStorePromptPreference,
  writeAppStorePromptPreference,
  type MobileOperatingSystem,
} from './appStorePrompt';

const browserStorage = {
  getItem: (key: string) => window.localStorage.getItem(key),
  setItem: (key: string, value: string) =>
    window.localStorage.setItem(key, value),
};

const isTextInputActive = (): boolean => {
  const activeElement = document.activeElement;
  if (!(activeElement instanceof HTMLElement)) return false;

  return (
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName) ||
    activeElement.isContentEditable
  );
};

const isAnotherModalOpen = (): boolean => {
  const modalRoot = document.getElementById('modal');
  return Boolean(modalRoot?.childElementCount);
};

function AppStorePrompt() {
  const pathname = usePathname();
  const { state, loginState } = useModalStore();
  const [mobileOperatingSystem, setMobileOperatingSystem] =
    useState<MobileOperatingSystem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasShownInSession, setHasShownInSession] = useState(false);
  const activeDurationRef = useRef(0);

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
  }, []);

  useEffect(() => {
    if (
      !mobileOperatingSystem ||
      !isAppStorePromptRoute(pathname) ||
      isOpen ||
      hasShownInSession
    ) {
      return undefined;
    }

    const preference = readAppStorePromptPreference(browserStorage);
    if (!canShowAppStorePrompt(preference, Date.now())) return undefined;

    let lastTickAt = Date.now();

    const resetLastTickAt = () => {
      lastTickAt = Date.now();
    };

    const intervalId = window.setInterval(() => {
      const now = Date.now();
      const elapsedSinceLastTick = now - lastTickAt;
      lastTickAt = now;

      if (
        document.visibilityState !== 'visible' ||
        window.isInApp === true ||
        state.isShowModal ||
        loginState.isShowLoginModal ||
        isTextInputActive() ||
        isAnotherModalOpen()
      ) {
        return;
      }

      activeDurationRef.current += elapsedSinceLastTick;
      if (activeDurationRef.current < APP_STORE_PROMPT_DELAY_MS) return;

      const latestPreference = readAppStorePromptPreference(browserStorage);
      if (!canShowAppStorePrompt(latestPreference, now)) return;

      try {
        sessionStorage.setItem(APP_STORE_PROMPT_SESSION_KEY, 'true');
      } catch {
        // Local state still prevents duplicate prompts in this mounted session.
      }

      setHasShownInSession(true);
      setIsOpen(true);
    }, 1_000);

    document.addEventListener('visibilitychange', resetLastTickAt);
    window.addEventListener('focus', resetLastTickAt);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', resetLastTickAt);
      window.removeEventListener('focus', resetLastTickAt);
    };
  }, [
    hasShownInSession,
    isOpen,
    loginState.isShowLoginModal,
    mobileOperatingSystem,
    pathname,
    state.isShowModal,
  ]);

  if (!isOpen || !mobileOperatingSystem) return null;

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
    <PromptModal
      mainText="앱에서 더 편리하게 이용해보세요."
      subText="BottleNote 앱에서 위스키 기록을 이어가세요."
      actionText="앱에서 시작하기"
      onAction={handleStoreClick}
      onClose={handleClose}
    />
  );
}

export default AppStorePrompt;
