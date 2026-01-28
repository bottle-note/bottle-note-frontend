'use client';

import { useRef, useCallback, useState } from 'react';

interface UseResultCaptureOptions {
  backgroundColor?: string;
  scale?: number;
}

/**
 * 결과 화면을 이미지로 캡처하는 훅
 */
export function useResultCapture(options?: UseResultCaptureOptions) {
  const { backgroundColor = '#0a0a0f', scale = 2 } = options || {};
  const resultRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  /**
   * DOM을 캔버스로 캡처하여 Blob 반환
   * 스크롤 영역 전체를 캡처함
   */
  const captureAsBlob = useCallback(async (): Promise<Blob | null> => {
    if (!resultRef.current) return null;

    setIsCapturing(true);
    try {
      const element = resultRef.current;

      // 원본 스타일 저장
      const originalStyles = {
        height: element.style.height,
        maxHeight: element.style.maxHeight,
        overflow: element.style.overflow,
        position: element.style.position,
      };

      // 전체 콘텐츠가 보이도록 스타일 수정
      element.style.height = 'auto';
      element.style.maxHeight = 'none';
      element.style.overflow = 'visible';

      // html2canvas 동적 임포트 (코드 스플리팅)
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(element, {
        backgroundColor,
        scale,
        useCORS: true,
        allowTaint: false,
        logging: false,
        height: element.scrollHeight,
        windowHeight: element.scrollHeight,
        y: 0,
        scrollY: 0,
      });

      // 원본 스타일 복원
      element.style.height = originalStyles.height;
      element.style.maxHeight = originalStyles.maxHeight;
      element.style.overflow = originalStyles.overflow;
      element.style.position = originalStyles.position;

      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
      });
    } catch (error) {
      console.error('캡처 실패:', error);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [backgroundColor, scale]);

  /**
   * 이미지 다운로드
   */
  const downloadImage = useCallback(
    async (filename?: string) => {
      const blob = await captureAsBlob();
      if (!blob) return false;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `bottle-note-tarot-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return true;
    },
    [captureAsBlob],
  );

  /**
   * 이미지 공유 (모바일 우선, 폴백으로 URL 복사)
   */
  const shareImage = useCallback(
    async (shareData?: {
      title?: string;
      text?: string;
      url?: string;
    }): Promise<'shared' | 'copied' | 'failed'> => {
      const blob = await captureAsBlob();

      if (!blob) return 'failed';

      const file = new File([blob], 'tarot-result.png', { type: 'image/png' });

      // 이미지 공유 지원 확인 (주로 모바일)
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            title: shareData?.title || '나의 2026 위스키 운세',
            text: shareData?.text,
            files: [file],
          });
          return 'shared';
        } catch (error) {
          // 사용자가 취소한 경우
          if ((error as Error).name === 'AbortError') {
            return 'failed';
          }
        }
      }

      // 폴백: URL 공유
      if (shareData?.url && navigator.share) {
        try {
          await navigator.share({
            title: shareData.title || '나의 2026 위스키 운세',
            text: shareData.text,
            url: shareData.url,
          });
          return 'shared';
        } catch {
          // 무시
        }
      }

      // 최종 폴백: 클립보드에 URL 복사
      if (shareData?.url) {
        try {
          await navigator.clipboard.writeText(shareData.url);
          return 'copied';
        } catch {
          return 'failed';
        }
      }

      return 'failed';
    },
    [captureAsBlob],
  );

  return {
    resultRef,
    isCapturing,
    captureAsBlob,
    downloadImage,
    shareImage,
  };
}
