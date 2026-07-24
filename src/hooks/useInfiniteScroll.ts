import { useCallback, useEffect, useRef, useState } from 'react';

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
  const [target, setTarget] = useState<HTMLDivElement | null>(null);
  const fetchRef = useRef(fetchNextPage);
  const isIntersectingRef = useRef(false);
  const hasTriggeredForCurrentIntersectionRef = useRef(false);
  const lastTriggerTimeRef = useRef(0);
  const pendingTriggerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  fetchRef.current = fetchNextPage;
  const targetRef = useCallback((node: HTMLDivElement | null) => {
    setTarget(node);
  }, []);

  const clearPendingTrigger = useCallback(() => {
    if (pendingTriggerRef.current === null) return;

    clearTimeout(pendingTriggerRef.current);
    pendingTriggerRef.current = null;
  }, []);

  const triggerFetch = useCallback(() => {
    if (!isIntersectingRef.current) return;

    const now = Date.now();
    const elapsedSinceLastTrigger = now - lastTriggerTimeRef.current;
    const remainingThrottleMs = throttleMs - elapsedSinceLastTrigger;

    if (throttleMs > 0 && remainingThrottleMs > 0) {
      if (pendingTriggerRef.current !== null) return;

      pendingTriggerRef.current = setTimeout(() => {
        pendingTriggerRef.current = null;

        if (!isIntersectingRef.current) return;

        lastTriggerTimeRef.current = Date.now();
        fetchRef.current();
      }, remainingThrottleMs);
      return;
    }

    lastTriggerTimeRef.current = now;
    fetchRef.current();
  }, [throttleMs]);

  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      isIntersectingRef.current = Boolean(entries[0]?.isIntersecting);

      if (!isIntersectingRef.current) {
        hasTriggeredForCurrentIntersectionRef.current = false;
        clearPendingTrigger();
        return;
      }

      if (hasTriggeredForCurrentIntersectionRef.current) return;

      hasTriggeredForCurrentIntersectionRef.current = true;
      triggerFetch();
    },
    [clearPendingTrigger, triggerFetch],
  );

  useEffect(() => {
    if (!target) return;

    const observer = new IntersectionObserver(observerCallback, options);

    observer.observe(target);
    return () => {
      isIntersectingRef.current = false;
      hasTriggeredForCurrentIntersectionRef.current = false;
      clearPendingTrigger();
      observer.unobserve(target);
    };
  }, [clearPendingTrigger, observerCallback, options, target]);

  return { targetRef };
};
