import { useCallback, useRef } from 'react';

/**
 * 가로 스크롤 목록에서 마우스 세로 휠을 가로 스크롤로 옮긴다.
 * 목록 끝에 닿으면 페이지 세로 스크롤로 넘기고, 가로 입력(트랙패드 스와이프)은 브라우저에 맡긴다.
 * React onWheel은 passive라 preventDefault가 막혀 리스너를 직접 등록한다.
 * 조건부로 렌더링되는 요소에도 붙도록 callback ref를 돌려준다.
 */
export function useHorizontalWheelScroll<T extends HTMLElement>() {
  const cleanupRef = useRef<(() => void) | null>(null);

  return useCallback((element: T | null) => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    if (!element) return;

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const maxScrollLeft = element.scrollWidth - element.clientWidth;
      const canScroll =
        event.deltaY > 0
          ? element.scrollLeft < maxScrollLeft
          : element.scrollLeft > 0;
      if (!canScroll) return;
      event.preventDefault();
      element.scrollBy({ left: event.deltaY });
    };

    element.addEventListener('wheel', handleWheel, { passive: false });
    cleanupRef.current = () =>
      element.removeEventListener('wheel', handleWheel);
  }, []);
}
