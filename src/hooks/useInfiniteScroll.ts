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

  const observerCallback: IntersectionObserverCallback = throttle((entries) => {
    if (entries[0].isIntersecting) {
      fetchNextPage();
    }
  });

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(observerCallback, options);

    observer.observe(target);
    return () => observer.unobserve(target);
  }, [observerCallback, options]);

  return { targetRef };
};
