import { useCallback, useEffect, useRef, useState } from 'react';
import { throttle } from '@/utils/throttle';

interface Options {
  root?: Element | Document;
  rootMargin?: string;
  threshold?: number | number[];
}

interface Props {
  fetchNextPage: () => void;
  options?: Options;
}

export const useInfiniteScroll = ({ fetchNextPage, options }: Props) => {
  const [target, setTarget] = useState<HTMLDivElement | null>(null);
  const fetchRef = useRef(fetchNextPage);
  fetchRef.current = fetchNextPage;

  const observerCallback = useRef(
    throttle((entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        fetchRef.current();
      }
    }),
  ).current;

  useEffect(() => {
    if (!target) return;

    const observer = new IntersectionObserver(observerCallback, options);

    observer.observe(target);
    return () => observer.unobserve(target);
  }, [observerCallback, options, target]);

  const targetRef = useCallback((node: HTMLDivElement | null) => {
    setTarget(node);
  }, []);

  return { targetRef };
};
