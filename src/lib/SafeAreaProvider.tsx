'use client';

import { useEffect } from 'react';

// Android 기본 상태바 높이 (dp 기준, 대부분의 기기에서 24-28dp)
const ANDROID_STATUS_BAR_HEIGHT = 24;
// Android 노치가 있는 기기의 추가 높이 (dp 기준)
const ANDROID_NOTCH_ADDITIONAL_HEIGHT = 20;
// Android 하단 네비게이션 바 높이 (제스처 네비게이션 시 더 작음)
const ANDROID_NAV_BAR_HEIGHT = 24;

/**
 * Android 기기인지 확인
 */
function isAndroidDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

/**
 * 노치가 있는 Android 기기인지 추정
 * (화면 비율로 추정: 18:9 이상이면 노치 가능성 높음)
 */
function hasAndroidNotch(): boolean {
  if (typeof window === 'undefined') return false;

  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const aspectRatio =
    Math.max(screenWidth, screenHeight) / Math.min(screenWidth, screenHeight);

  return aspectRatio >= 2.0;
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

  const hasNotch = hasAndroidNotch();

  const topInset = hasNotch
    ? ANDROID_STATUS_BAR_HEIGHT + ANDROID_NOTCH_ADDITIONAL_HEIGHT
    : ANDROID_STATUS_BAR_HEIGHT;

  const bottomInset = ANDROID_NAV_BAR_HEIGHT;

  document.documentElement.style.setProperty(
    '--android-safe-area-top',
    `${topInset}px`,
  );
  document.documentElement.style.setProperty(
    '--android-safe-area-bottom',
    `${bottomInset}px`,
  );
}

/**
 * Android WebView에서 env(safe-area-inset-*)가 동작하지 않을 때
 * fallback 값을 CSS 변수로 주입하는 Provider
 *
 * CSS에서 max(env(), var(--android-...)) 구조를 사용하므로
 * Android에서는 무조건 fallback을 설정해도 안전함
 */
export function SafeAreaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (isAndroidDevice()) {
      applyAndroidSafeAreaFallback();
    }
  }, []);

  return <>{children}</>;
}
