'use client';

import { useCallback, useMemo } from 'react';

import type {
  ShareConfig,
  ShareChannel,
  SharePlatform,
  ShareResult,
} from '@/types/share';
import { useKakaoShare } from './useKakaoShare';
import { useLinkShare } from './useLinkShare';

interface UseShareOptions {
  /** 바텀시트 열릴 때 카카오 SDK 미리 로드 */
  preloadKakao?: boolean;
  /** 공유 완료 후 콜백 (analytics 용) */
  onShareComplete?: (result: ShareResult & { config: ShareConfig }) => void;
}

interface UseShareReturn {
  /** 카카오톡으로 공유 */
  shareToKakao: (config: ShareConfig) => Promise<ShareResult>;
  /** 링크 복사 */
  copyLink: (config: ShareConfig) => Promise<ShareResult>;
  /** 네이티브 공유 시트 (앱 환경에서만 동작) */
  shareNative: (config: ShareConfig) => Promise<ShareResult>;
  /** 현재 플랫폼 */
  platform: SharePlatform;
  /** 네이티브 공유 가능 여부 */
  isNativeAvailable: boolean;
  /** 카카오 SDK 준비 여부 */
  isKakaoReady: boolean;
  /** 카카오 로딩 중 */
  isKakaoLoading: boolean;
  /** 링크 복사 완료 여부 */
  isCopied: boolean;
}

// Platform detection helper
function detectPlatform(): SharePlatform {
  if (typeof window === 'undefined') return 'web';

  const userAgent = window.navigator.userAgent;

  // Check for native app WebView
  // App team should set a custom user agent or use window.BottleNote
  if (window.BottleNote?.share) {
    if (/iPhone|iPad|iPod/.test(userAgent)) return 'app-ios';
    if (/Android/.test(userAgent)) return 'app-android';
  }

  return 'web';
}

// Check if native share is available
function isNativeShareAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return !!window.BottleNote?.share?.isAvailable?.();
}

/**
 * 통합 공유 훅
 *
 * 플랫폼(웹/앱)을 자동 감지하고 적절한 공유 방식을 제공합니다.
 *
 * @example
 * ```tsx
 * const { shareToKakao, copyLink, shareNative, platform } = useShare({
 *   preloadKakao: true,
 *   onShareComplete: (result) => {
 *     analytics.track('share', {
 *       channel: result.channel,
 *       contentType: result.config.type,
 *     });
 *   },
 * });
 *
 * const handleShare = () => {
 *   const config = {
 *     type: 'review',
 *     contentId: '123',
 *     title: '내 리뷰',
 *     description: '맛있어요',
 *     imageUrl: 'https://...',
 *     linkUrl: 'https://...',
 *   };
 *
 *   // 카카오톡 공유
 *   await shareToKakao(config);
 *
 *   // 링크 복사
 *   await copyLink(config);
 *
 *   // 네이티브 공유 (앱 환경)
 *   if (isNativeAvailable) {
 *     await shareNative(config);
 *   }
 * };
 * ```
 */
export function useShare(options: UseShareOptions = {}): UseShareReturn {
  const { preloadKakao = false, onShareComplete } = options;

  const {
    shareToKakao: kakaoShare,
    isReady: isKakaoReady,
    isLoading: isKakaoLoading,
  } = useKakaoShare({ preload: preloadKakao });
  const { copyLink: linkCopy, isCopied } = useLinkShare();

  const platform = useMemo(() => detectPlatform(), []);
  const isNativeAvailable = useMemo(() => isNativeShareAvailable(), []);

  const shareToKakao = useCallback(
    async (config: ShareConfig): Promise<ShareResult> => {
      const success = await kakaoShare({
        title: config.title,
        description: config.description,
        imageUrl: config.imageUrl,
        linkUrl: config.linkUrl,
        buttonTitle: config.buttonTitle,
      });

      const result: ShareResult = {
        success,
        channel: 'kakao',
        error: success ? undefined : '카카오톡 공유에 실패했습니다.',
      };

      onShareComplete?.({ ...result, config });
      return result;
    },
    [kakaoShare, onShareComplete],
  );

  const copyLinkFn = useCallback(
    async (config: ShareConfig): Promise<ShareResult> => {
      const success = await linkCopy(config.linkUrl);

      const result: ShareResult = {
        success,
        channel: 'link',
        error: success ? undefined : '링크 복사에 실패했습니다.',
      };

      onShareComplete?.({ ...result, config });
      return result;
    },
    [linkCopy, onShareComplete],
  );

  const shareNative = useCallback(
    async (config: ShareConfig): Promise<ShareResult> => {
      // Native bridge implementation (for future app integration)
      if (!isNativeAvailable) {
        // Fallback to web share API if available
        if (typeof navigator !== 'undefined' && navigator.share) {
          try {
            await navigator.share({
              title: config.title,
              text: config.description,
              url: config.linkUrl,
            });

            const result: ShareResult = {
              success: true,
              channel: 'native',
            };
            onShareComplete?.({ ...result, config });
            return result;
          } catch (error) {
            // User cancelled or error
            const result: ShareResult = {
              success: false,
              channel: 'native',
              error: '공유가 취소되었습니다.',
            };
            onShareComplete?.({ ...result, config });
            return result;
          }
        }

        return {
          success: false,
          channel: 'native',
          error: '네이티브 공유를 사용할 수 없습니다.',
        };
      }

      // Call native bridge
      try {
        const result = await window.BottleNote!.share.share(config);
        onShareComplete?.({ ...result, config });
        return result;
      } catch (error) {
        const result: ShareResult = {
          success: false,
          channel: 'native',
          error: '네이티브 공유에 실패했습니다.',
        };
        onShareComplete?.({ ...result, config });
        return result;
      }
    },
    [isNativeAvailable, onShareComplete],
  );

  return {
    shareToKakao,
    copyLink: copyLinkFn,
    shareNative,
    platform,
    isNativeAvailable,
    isKakaoReady,
    isKakaoLoading,
    isCopied,
  };
}
