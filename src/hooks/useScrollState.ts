'use client';

import { useState, useEffect, useRef } from 'react';
import { throttle } from '@/utils/throttle';

interface ScrollState {
  isVisible: boolean;
  isAtTop: boolean;
}

export const useScrollState = (threshold = 100) => {
  const [scrollState, setScrollState] = useState<ScrollState>({
    isVisible: true,
    isAtTop: true,
  });
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = throttle(() => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 10;

      if (Math.abs(currentScrollY - lastScrollY.current) < scrollThreshold) {
        return;
      }

      const isAtTop = currentScrollY < threshold;
      const isScrollingDown = currentScrollY > lastScrollY.current;
      const isVisible = !isScrollingDown || currentScrollY <= threshold;

      setScrollState({
        isVisible,
        isAtTop,
      });

      lastScrollY.current = currentScrollY;
    }, 16);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return scrollState;
};
