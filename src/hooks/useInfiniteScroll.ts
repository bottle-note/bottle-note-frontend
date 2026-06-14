import { useCallback, useEffect, useRef } from 'react';

const DEFAULT_THROTTLE_MS = 100;

interface Props {
  fetchNextPage: () => void;
  options?: IntersectionObserverInit;
  throttleMs?: number;
}

export const useInfiniteScroll = ({
  fetchNextPage,
  options,
  throttleMs = DEFAULT_THROTTLE_MS,
}: Props) => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const fetchRef = useRef(fetchNextPage);
  const lastTriggerTimeRef = useRef(0);
  fetchRef.current = fetchNextPage;

  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (!entries[0]?.isIntersecting) return;

      const now = Date.now();
      const elapsedSinceLastTrigger = now - lastTriggerTimeRef.current;
      const isWithinThrottleWindow =
        throttleMs > 0 && elapsedSinceLastTrigger < throttleMs;

      if (isWithinThrottleWindow) {
        return;
      }

      lastTriggerTimeRef.current = now;
      fetchRef.current();
    },
    [throttleMs],
  );

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(observerCallback, options);

    observer.observe(target);
    return () => observer.unobserve(target);
  }, [observerCallback, options]);

  return { targetRef };
};
