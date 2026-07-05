'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AutoMarqueeTextProps {
  text: string;
  className?: string;
  containerClassName?: string;
}

export default function AutoMarqueeText({
  text,
  className,
  containerClassName,
}: AutoMarqueeTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [marqueeDistance, setMarqueeDistance] = useState(0);

  useEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const textElement = textRef.current;

      if (!container || !textElement) {
        return;
      }

      setMarqueeDistance(
        Math.max(0, textElement.scrollWidth - container.clientWidth),
      );
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    if (textRef.current) {
      resizeObserver.observe(textRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [text]);

  const shouldMarquee = marqueeDistance > 4;

  return (
    <span
      ref={containerRef}
      className={cn('block min-w-0 overflow-hidden', containerClassName)}
    >
      <span
        ref={textRef}
        className={cn(
          'block whitespace-nowrap',
          className,
          shouldMarquee ? 'auto-marquee-text w-fit' : 'truncate',
        )}
        style={
          shouldMarquee
            ? ({
                '--auto-marquee-distance': `${marqueeDistance}px`,
              } as CSSProperties)
            : undefined
        }
      >
        {text}
      </span>
    </span>
  );
}
