'use client';

import { useEffect } from 'react';

// Android 기본 상태바 높이 (dp 기준, 대부분의 기기에서 24-28dp)
const ANDROID_STATUS_BAR_HEIGHT = 24;
// Android 노치가 있는 기기의 추가 높이 (dp 기준)
const ANDROID_NOTCH_ADDITIONAL_HEIGHT = 20;
// Android 하단 네비게이션 바 높이 (제스처 네비게이션 시 더 작음)
const ANDROID_NAV_BAR_HEIGHT = 24;

/**
 * env(safe-area-inset-*)가 실제로 동작하는지 테스트
 */
function testEnvSafeAreaSupport(): boolean {
  const testEl = document.createElement('div');
  testEl.style.paddingTop = 'env(safe-area-inset-top, -9999px)';
  document.body.appendChild(testEl);

  const computed = getComputedStyle(testEl).paddingTop;
  document.body.removeChild(testEl);

  // -9999px가 반환되면 env()가 지원되지 않음
  // 0px가 반환되면 지원되지만 값이 없는 것 (Android WebView에서 흔함)
  return computed !== '-9999px' && computed !== '0px';
}

/**
 * Android 기기인지 확인
 */
function isAndroidDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

/**
 * 노치가 있는 Android 기기인지 추정
 * (화면 비율과 해상도로 추정)
 */
function hasAndroidNotch(): boolean {
  if (typeof window === 'undefined') return false;

  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const aspectRatio =
    Math.max(screenWidth, screenHeight) / Math.min(screenWidth, screenHeight);

  // 18:9 이상의 화면 비율은 노치가 있을 가능성이 높음
  return aspectRatio >= 2.0;
}

/**
 * Android safe area fallback 값 설정
 */
function applyAndroidSafeAreaFallback(): void {
  const hasNotch = hasAndroidNotch();

  // 상단: 상태바 + 노치 (있는 경우)
  const topInset = hasNotch
    ? ANDROID_STATUS_BAR_HEIGHT + ANDROID_NOTCH_ADDITIONAL_HEIGHT
    : ANDROID_STATUS_BAR_HEIGHT;

  // 하단: 제스처 네비게이션 힌트 영역
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
 */
export function SafeAreaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Android가 아니면 iOS env()가 잘 동작하므로 스킵
    if (!isAndroidDevice()) return;

    // env() 지원 테스트
    const envSupported = testEnvSafeAreaSupport();

    // env()가 동작하지 않거나 0을 반환하면 fallback 적용
    if (!envSupported) {
      applyAndroidSafeAreaFallback();
    }
  }, []);

  return <>{children}</>;
}
