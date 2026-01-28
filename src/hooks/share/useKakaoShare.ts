'use client';

import { useCallback, useEffect, useState } from 'react';

import { loadKakaoSDK, isKakaoInitialized } from '@/lib/kakao/kakaoSDK';
import type { KakaoShareOptions } from '@/lib/kakao/types';

interface UseKakaoShareOptions {
  /** 바텀시트 열릴 때 미리 SDK 로드 */
  preload?: boolean;
}

interface UseKakaoShareReturn {
  /** 카카오톡으로 공유 */
  shareToKakao: (options: KakaoShareOptions) => Promise<boolean>;
  /** SDK 초기화 완료 여부 */
  isReady: boolean;
  /** 로딩 중 여부 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
}

/**
 * 카카오톡 공유 훅
 *
 * @example
 * ```tsx
 * const { shareToKakao, isReady, isLoading } = useKakaoShare({ preload: true });
 *
 * const handleShare = () => {
 *   shareToKakao({
 *     title: '제목',
 *     description: '설명',
 *     imageUrl: 'https://example.com/image.png',
 *     linkUrl: 'https://example.com',
 *     buttonTitle: '자세히 보기',
 *   });
 * };
 * ```
 */
export function useKakaoShare(
  options: UseKakaoShareOptions = {},
): UseKakaoShareReturn {
  const { preload = false } = options;
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // preload 옵션이 true면 마운트 시 SDK 미리 로드
  useEffect(() => {
    if (preload) {
      loadKakaoSDK().then((success) => {
        setIsReady(success);
        if (!success) {
          setError('카카오 SDK 초기화에 실패했습니다.');
        }
      });
    } else {
      // preload가 아니어도 이미 초기화되어 있으면 ready 상태로
      setIsReady(isKakaoInitialized());
    }
  }, [preload]);

  const shareToKakao = useCallback(
    async (shareOptions: KakaoShareOptions): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // SDK가 준비되지 않았으면 로드 시도
        if (!isKakaoInitialized()) {
          const success = await loadKakaoSDK();
          setIsReady(success);

          if (!success) {
            setError('카카오톡 공유를 사용할 수 없습니다.');
            return false;
          }
        }

        const { title, description, imageUrl, linkUrl, buttonTitle } =
          shareOptions;

        // 카카오톡 공유 실행
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title,
            description,
            imageUrl,
            link: {
              mobileWebUrl: linkUrl,
              webUrl: linkUrl,
            },
          },
          buttons: [
            {
              title: buttonTitle || '자세히 보기',
              link: {
                mobileWebUrl: linkUrl,
                webUrl: linkUrl,
              },
            },
          ],
        });

        return true;
      } catch (err) {
        console.error('[useKakaoShare] 공유 실패:', err);
        setError('카카오톡 공유에 실패했습니다.');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    shareToKakao,
    isReady,
    isLoading,
    error,
  };
}
