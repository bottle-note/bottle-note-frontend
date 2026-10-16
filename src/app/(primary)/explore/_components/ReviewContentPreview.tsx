import { useLayoutEffect, useRef, useState } from 'react';

interface Props {
  content: string;
}

/** 리뷰 본문을 4줄까지만 보여주고, 실제로 잘린 경우에만 마지막 줄 끝에 더보기를 붙인다. */
export default function ReviewContentPreview({ content }: Props) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isClamped, setIsClamped] = useState(false);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return undefined;

    const measure = () => setIsClamped(el.scrollHeight > el.clientHeight + 1);
    measure();

    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [content]);

  // line-clamp는 빈 줄에서도 브라우저 말줄임표를 따로 그리므로 text-15 줄 높이(19px) × 4줄로 자른다.
  return (
    <div className="relative">
      <p
        ref={textRef}
        className="max-h-[76px] overflow-hidden whitespace-pre-line break-words text-15 text-fg-neutral"
      >
        {content}
      </p>
      {isClamped && (
        <span className="absolute bottom-0 right-0 bg-gradient-to-r from-transparent to-bg-layer-default to-[28px] pl-28 text-15 text-fg-neutral-muted">
          ... 더보기
        </span>
      )}
    </div>
  );
}
