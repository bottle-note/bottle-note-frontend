'use client';

import { CircleHelp } from 'lucide-react';
import { useNavLayout } from '@/components/ui/Layout/NavLayout';
import { cn } from '@/lib/utils';
import UnderlineSearchBar, {
  type UnderlineSearchBarProps,
} from './UnderlineSearchBar';

interface StickySearchBarProps
  extends Omit<UnderlineSearchBarProps, 'onFocusChange'> {
  isSearchActive: boolean;
  onSearchActiveChange: (active: boolean) => void;
  description?: string;
  containerClassName?: string;
  testId?: string;
  headerExpandedHeight?: string;
  headerSlideDistance?: string;
}

export default function StickySearchBar({
  isSearchActive,
  onSearchActiveChange,
  description,
  containerClassName,
  testId,
  headerExpandedHeight = 'var(--logo-header-expanded-height)',
  headerSlideDistance = 'var(--logo-header-slide-distance)',
  placeholder = '키워드를 입력하세요',
  ...searchBarProps
}: StickySearchBarProps) {
  const { isNavigationVisible } = useNavLayout();
  const shouldShowSearchBar = isSearchActive || isNavigationVisible;
  const searchBarTransform = isSearchActive
    ? `translateY(calc(-1 * ${headerSlideDistance}))`
    : isNavigationVisible
      ? 'translateY(0)'
      : `translateY(calc(-100% - ${headerSlideDistance}))`;

  return (
    <section
      data-testid={testId}
      className={cn(
        'scroll-navigation-motion sticky z-[9] bg-bg-layer-default text-fg-neutral transition-[transform,opacity,margin-bottom]',
        shouldShowSearchBar
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none opacity-0',
        containerClassName,
      )}
      style={{
        top: headerExpandedHeight,
        transform: searchBarTransform,
        marginBottom: isSearchActive
          ? `calc(-1 * ${headerSlideDistance})`
          : '0px',
      }}
    >
      <article className="relative w-full">
        <UnderlineSearchBar
          {...searchBarProps}
          placeholder={placeholder}
          onFocusChange={onSearchActiveChange}
        />

        {description && (
          <div className="flex items-start gap-[2px] py-[10px]">
            <CircleHelp
              aria-hidden
              className="mt-[1px] h-3.5 w-3.5 shrink-0 text-fg-brand"
            />
            <p className="whitespace-pre-line text-12 text-fg-neutral-muted">
              {description}
            </p>
          </div>
        )}
      </article>
    </section>
  );
}
