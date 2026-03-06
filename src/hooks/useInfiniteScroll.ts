import { useEffect, useRef } from 'react';
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
  const targetRef = useRef<HTMLDivElement | null>(null);
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
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(observerCallback, options);

    observer.observe(target);
    return () => observer.unobserve(target);
  }, [observerCallback, options]);

  return { targetRef };
};
