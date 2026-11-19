'use client';

import { useEffect, useRef } from 'react';
import { useNavLayout } from '@/components/ui/Layout/NavLayout';
import { cn } from '@/lib/utils';
import { SubHeader } from './SubHeader';

interface AutoHideLogoHeaderProps {
  isVisible?: boolean;
  sticky?: boolean;
  className?: string;
  title?: string;
}

export default function AutoHideLogoHeader({
  isVisible,
  sticky = true,
  className,
  title,
}: AutoHideLogoHeaderProps) {
  const { isNavigationVisible } = useNavLayout();
  const shouldShowHeader = isVisible ?? isNavigationVisible;
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    headerRef.current?.toggleAttribute('inert', !shouldShowHeader);
  }, [shouldShowHeader]);

  return (
    <header
      ref={headerRef}
      aria-hidden={!shouldShowHeader}
      className={cn(
        'scroll-navigation-motion z-10 bg-bg-layer-default transition-[transform,opacity]',
        sticky && 'sticky top-0',
        shouldShowHeader
          ? 'translate-y-0 opacity-100'
          : sticky
            ? 'pointer-events-none -translate-y-full opacity-0'
            : 'hidden',
        className,
      )}
    >
      <SubHeader>
        <SubHeader.Left>
          <SubHeader.Logo />
        </SubHeader.Left>
        {title && <SubHeader.Center>{title}</SubHeader.Center>}
        <SubHeader.Right>
          <div className="flex items-center gap-x-12">
            <SubHeader.Search />
            <SubHeader.NotificationBell />
            <SubHeader.Profile />
            <SubHeader.Menu />
          </div>
        </SubHeader.Right>
      </SubHeader>
    </header>
  );
}
