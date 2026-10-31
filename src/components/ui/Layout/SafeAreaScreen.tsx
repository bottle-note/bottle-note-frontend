import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SafeAreaScreenProps extends HTMLAttributes<HTMLDivElement> {
  /** 하단 고정 영역이 직접 `max(여백, var(--safe-area-bottom))`을 두는 화면은 false */
  insetBottom?: boolean;
}

/**
 * 공통 상단 바(SubHeader)와 하단 내비 없이 화면 전체를 직접 그리는 페이지의 틀.
 * 화면 높이를 채우고 배경은 상태 표시줄·홈 인디케이터 뒤까지 깔되, 내용은 safe area 안쪽에 둔다.
 * 앱(WebView)은 화면 끝까지 그리므로 이 틀 없이 맨 위에 둔 헤더는 상태 표시줄에 가려진다.
 */
const SafeAreaScreen = forwardRef<HTMLDivElement, SafeAreaScreenProps>(
  function SafeAreaScreen({ insetBottom = true, className, ...props }, ref) {
    return (
      <div
        ref={ref}
        {...props}
        className={cn(
          'flex h-dvh min-h-0 flex-col overflow-hidden pt-safe',
          insetBottom && 'pb-safe-area',
          className,
        )}
      />
    );
  },
);

export default SafeAreaScreen;
