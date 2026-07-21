'use client';

import { useState, useEffect, useRef } from 'react';
import { throttle } from '@/utils/throttle';

interface ScrollState {
  isVisible: boolean;
  isAtTop: boolean;
}

const MIN_SCROLLABLE_DISTANCE = 1;
const SCROLL_DELTA_THRESHOLD = 10;

export const useScrollState = (threshold = 100) => {
  const [scrollState, setScrollState] = useState<ScrollState>({
    isVisible: true,
    isAtTop: true,
  });
  const lastScrollY = useRef(0);
  const lastMaxScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = throttle(() => {
      const currentScrollY = window.scrollY;
      const maxScrollY = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );

      if (maxScrollY <= MIN_SCROLLABLE_DISTANCE) {
        setScrollState((previous) =>
          previous.isVisible && previous.isAtTop
            ? previous
            : { isVisible: true, isAtTop: true },
        );
        lastScrollY.current = currentScrollY;
        lastMaxScrollY.current = maxScrollY;
        return;
      }

      const hideThreshold = Math.min(threshold, maxScrollY / 2);
      const scrollDeltaThreshold = Math.min(
        SCROLL_DELTA_THRESHOLD,
        hideThreshold,
      );
      const isAtTop = currentScrollY < hideThreshold;

      if (
        lastMaxScrollY.current > maxScrollY &&
        lastScrollY.current > maxScrollY
      ) {
        setScrollState((previous) =>
          previous.isAtTop === isAtTop ? previous : { ...previous, isAtTop },
        );
        lastScrollY.current = currentScrollY;
        lastMaxScrollY.current = maxScrollY;
        return;
      }

      lastMaxScrollY.current = maxScrollY;
      const scrollDelta = currentScrollY - lastScrollY.current;

      if (Math.abs(scrollDelta) < scrollDeltaThreshold) {
        return;
      }

      const isScrollingDown = scrollDelta > 0;
      const isVisible = isAtTop || !isScrollingDown;

      setScrollState((previous) =>
        previous.isVisible === isVisible && previous.isAtTop === isAtTop
          ? previous
          : { isVisible, isAtTop },
      );

      lastScrollY.current = currentScrollY;
    }, 16);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return scrollState;
};
