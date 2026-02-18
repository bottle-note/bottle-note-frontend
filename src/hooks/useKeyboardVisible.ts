import { useState, useEffect } from 'react';

const VIEWPORT_RATIO_THRESHOLD = 0.75;

/**
 * 모바일 키보드 표시 여부를 감지하는 훅
 * visualViewport API를 사용하여 뷰포트 크기 변화로 키보드 유무를 판단
 *
 * @returns isKeyboardVisible - 키보드 표시 상태
 */
export const useKeyboardVisible = (): boolean => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const initialHeight = window.innerHeight;

    const handleResize = () => {
      const isKeyboard = viewport.height < initialHeight * VIEWPORT_RATIO_THRESHOLD;
      setIsKeyboardVisible(isKeyboard);
    };

    viewport.addEventListener('resize', handleResize);
    return () => {
      viewport.removeEventListener('resize', handleResize);
    };
  }, []);

  return isKeyboardVisible;
};
