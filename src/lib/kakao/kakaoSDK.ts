/**
 * 카카오 SDK 로드 및 초기화 유틸리티
 * 싱글톤 패턴으로 중복 로드 방지
 */

import '@/lib/kakao/types';

const KAKAO_SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.5/kakao.min.js';

// SDK 로드 상태
let sdkLoadPromise: Promise<boolean> | null = null;

/**
 * 카카오 SDK가 이미 초기화되었는지 확인
 */
export function isKakaoInitialized(): boolean {
  return (
    typeof window !== 'undefined' && window.Kakao?.isInitialized?.() === true
  );
}

/**
 * 카카오 SDK 로드 및 초기화 (싱글톤)
 * 중복 호출 시 기존 Promise 반환
 */
export function loadKakaoSDK(): Promise<boolean> {
  // 이미 로드 중이면 기존 Promise 반환
  if (sdkLoadPromise) {
    return sdkLoadPromise;
  }

  sdkLoadPromise = new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
    if (!kakaoKey) {
      console.error(
        '[KakaoSDK] NEXT_PUBLIC_KAKAO_CLIENT_ID가 설정되지 않았습니다.',
      );
      resolve(false);
      return;
    }

    // 이미 초기화되어 있으면 바로 성공
    if (window.Kakao?.isInitialized?.()) {
      resolve(true);
      return;
    }

    // SDK가 로드되어 있지만 초기화 안 된 경우
    if (window.Kakao) {
      try {
        window.Kakao.init(kakaoKey);
        resolve(true);
      } catch (error) {
        console.error('[KakaoSDK] 초기화 실패:', error);
        resolve(false);
      }
      return;
    }

    // 기존 스크립트가 로드 중인지 확인
    const existingScript = document.querySelector(
      'script[src*="kakao_js_sdk"]',
    ) as HTMLScriptElement | null;

    if (existingScript) {
      // 이미 로딩 중이면 로드 완료 대기
      const handleLoad = () => {
        try {
          if (window.Kakao && !window.Kakao.isInitialized()) {
            window.Kakao.init(kakaoKey);
          }
          resolve(window.Kakao?.isInitialized?.() ?? false);
        } catch {
          resolve(false);
        }
        existingScript.removeEventListener('load', handleLoad);
      };
      existingScript.addEventListener('load', handleLoad);

      // 이미 로드 완료된 경우
      if (existingScript.dataset.loaded === 'true') {
        handleLoad();
      }
      return;
    }

    // SDK 스크립트 새로 로드
    const script = document.createElement('script');
    script.src = KAKAO_SDK_URL;
    script.async = true;
    script.crossOrigin = 'anonymous';

    // integrity 속성이 있으면 추가
    const integrityHash = process.env.NEXT_PUBLIC_KAKAO_INTEGRITY_HASH;
    if (integrityHash) {
      script.integrity = integrityHash;
    }

    script.onload = () => {
      script.dataset.loaded = 'true';
      try {
        if (window.Kakao && !window.Kakao.isInitialized()) {
          window.Kakao.init(kakaoKey);
        }
        resolve(window.Kakao?.isInitialized?.() ?? false);
      } catch (error) {
        console.error('[KakaoSDK] 로드 후 초기화 실패:', error);
        resolve(false);
      }
    };

    script.onerror = () => {
      console.error('[KakaoSDK] 스크립트 로드 실패');
      resolve(false);
    };

    document.head.appendChild(script);
  });

  return sdkLoadPromise;
}

/**
 * SDK 로드 상태 초기화 (테스트용)
 */
export function resetKakaoSDK(): void {
  sdkLoadPromise = null;
}
