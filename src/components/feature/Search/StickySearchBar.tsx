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
}

export default function StickySearchBar({
  isSearchActive,
  onSearchActiveChange,
  description,
  containerClassName,
  testId,
  placeholder = '키워드를 입력하세요',
  ...searchBarProps
}: StickySearchBarProps) {
  const { isNavigationVisible } = useNavLayout();
  const shouldShowSearchBar = isSearchActive || isNavigationVisible;

  return (
    <section
      data-testid={testId}
      data-visible={shouldShowSearchBar}
      className={cn(
        'scroll-navigation-motion sticky top-[calc(var(--safe-area-top)+var(--bookmark-tab-height))] z-[9] bg-bg-layer-default text-fg-neutral transition-[transform,opacity]',
        shouldShowSearchBar
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none -translate-y-full opacity-0',
        containerClassName,
      )}
    >
      <article className="relative w-full">
        <UnderlineSearchBar
          {...searchBarProps}
          placeholder={placeholder}
          onFocusChange={onSearchActiveChange}
        />

        {description && (
          <div className="flex items-start gap-2 py-10">
            <CircleHelp
              aria-hidden
              className="mt-1 h-14 w-14 shrink-0 text-fg-brand"
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
