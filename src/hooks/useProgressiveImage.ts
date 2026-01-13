import { useState, useCallback } from 'react';

interface UseProgressiveImageOptions {
  src: string;
  placeholderSrc?: string;
}

interface UseProgressiveImageReturn {
  /** 무거운 이미지 로드 완료 여부 */
  isLoaded: boolean;
  /** placeholder 이미지가 있는지 여부 */
  hasPlaceholder: boolean;
  /** 스켈레톤을 보여줘야 하는지 (placeholder 없고 아직 로드 안됨) */
  shouldShowSkeleton: boolean;
  /** 먼저 보여줄 이미지 (placeholder 또는 원본) */
  lightSrc: string;
  /** 나중에 로드할 무거운 이미지 */
  heavySrc: string;
  /** 무거운 이미지 로드 완료 핸들러 */
  onHeavyLoad: () => void;
}

export const useProgressiveImage = ({
  src,
  placeholderSrc,
}: UseProgressiveImageOptions): UseProgressiveImageReturn => {
  const [isLoaded, setIsLoaded] = useState(false);
  const hasPlaceholder = !!placeholderSrc;

  const onHeavyLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return {
    isLoaded,
    hasPlaceholder,
    shouldShowSkeleton: !hasPlaceholder && !isLoaded,
    lightSrc: placeholderSrc ?? src,
    heavySrc: src,
    onHeavyLoad,
  };
};
