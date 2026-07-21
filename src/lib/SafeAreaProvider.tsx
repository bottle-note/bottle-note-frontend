'use client';

import { useEffect } from 'react';

const ANDROID_SAFE_AREA_FALLBACK = 24;

/**
 * BottleNote Android 인앱 WebView인지 확인
 */
function isAndroidInApp(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  return window.isInApp === true && /Android/i.test(navigator.userAgent);
}

/**
 * Android safe area fallback 값을 CSS 변수로 설정
 * CSS에서 max(env(), var(--android-...))로 사용되므로
 * env()가 동작하면 더 큰 값이 선택됨
 */
function applyAndroidSafeAreaFallback(): void {
  if (typeof document === 'undefined' || !document.documentElement) {
    return;
  }

  document.documentElement.style.setProperty(
    '--android-safe-area-top',
    `${ANDROID_SAFE_AREA_FALLBACK}px`,
  );
  document.documentElement.style.setProperty(
    '--android-safe-area-bottom',
    `${ANDROID_SAFE_AREA_FALLBACK}px`,
  );
}

/**
 * BottleNote Android 인앱 WebView에 fallback 값을 주입하는 Provider
 *
 * 일반 모바일 브라우저와 iOS는 CSS env(safe-area-inset-*) 값만 사용한다.
 */
export function SafeAreaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (isAndroidInApp()) {
      applyAndroidSafeAreaFallback();
    }
  }, []);

  return <>{children}</>;
}
