'use client';

import { useCallback, useState } from 'react';

interface UseLinkShareReturn {
  /** 링크를 클립보드에 복사 */
  copyLink: (url: string) => Promise<boolean>;
  /** 복사 성공 여부 */
  isCopied: boolean;
  /** 로딩 중 여부 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 복사 상태 초기화 */
  reset: () => void;
}

interface UseLinkShareOptions {
  /** 복사 성공 후 자동으로 isCopied를 false로 초기화하는 시간 (ms) */
  resetDelay?: number;
}

/**
 * 링크 복사 훅
 *
 * @example
 * ```tsx
 * const { copyLink, isCopied, isLoading } = useLinkShare({ resetDelay: 3000 });
 *
 * const handleCopy = () => {
 *   copyLink('https://example.com');
 * };
 * ```
 */
export function useLinkShare(
  options: UseLinkShareOptions = {},
): UseLinkShareReturn {
  const { resetDelay } = options;
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsCopied(false);
    setError(null);
  }, []);

  const copyLink = useCallback(
    async (url: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // Clipboard API 지원 확인
        if (!navigator.clipboard) {
          // 폴백: execCommand 사용
          const textArea = document.createElement('textarea');
          textArea.value = url;
          textArea.style.position = 'fixed';
          textArea.style.left = '-9999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          const success = document.execCommand('copy');
          document.body.removeChild(textArea);

          if (!success) {
            throw new Error('execCommand copy failed');
          }
        } else {
          await navigator.clipboard.writeText(url);
        }

        setIsCopied(true);

        // resetDelay가 설정되어 있으면 자동 초기화
        if (resetDelay && resetDelay > 0) {
          setTimeout(() => {
            setIsCopied(false);
          }, resetDelay);
        }

        return true;
      } catch (err) {
        console.error('[useLinkShare] 복사 실패:', err);
        setError('링크 복사에 실패했습니다.');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [resetDelay],
  );

  return {
    copyLink,
    isCopied,
    isLoading,
    error,
    reset,
  };
}
