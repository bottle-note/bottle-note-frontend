'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

const CONTENT_WIDTH_CLASS = {
  form: 'content-width-form',
  mobile: 'content-width-mobile',
} as const;

type ContentWidthSize = keyof typeof CONTENT_WIDTH_CLASS;

// 포털로 뜨는 오버레이는 DOM 상속을 받지 못해, 화면 너비를 context로 넘긴다.
const ContentWidthContext = createContext<ContentWidthSize | null>(null);

/** 현재 화면이 좁힌 너비 클래스. 기본 너비 화면이면 빈 문자열 */
export function useContentWidthClass() {
  const size = useContext(ContentWidthContext);
  return size ? CONTENT_WIDTH_CLASS[size] : '';
}

/** 모달·시트 너비: 입력 화면 너비를 넘지 않되, 더 좁은 화면이면 그 너비를 따른다 */
export function useOverlayWidthClass() {
  const size = useContext(ContentWidthContext);
  return CONTENT_WIDTH_CLASS[size === 'mobile' ? 'mobile' : 'form'];
}

interface ContentWidthProps {
  size: ContentWidthSize;
  className?: string;
  children: ReactNode;
}

/**
 * 하위 화면의 최대 너비를 좁힌다. CSS 변수로 내려주므로 화면 안의
 * fixed-content 헤더·하단 버튼도 같은 너비를 따른다.
 */
export default function ContentWidth({
  size,
  className,
  children,
}: ContentWidthProps) {
  return (
    <ContentWidthContext.Provider value={size}>
      <div
        className={cn(
          'mx-auto w-full max-w-content',
          CONTENT_WIDTH_CLASS[size],
          className,
        )}
      >
        {children}
      </div>
    </ContentWidthContext.Provider>
  );
}
