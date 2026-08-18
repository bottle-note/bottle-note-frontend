'use client';

import { useEffect, useRef } from 'react';
import { useNavLayout } from '@/components/ui/Layout/NavLayout';
import { cn } from '@/lib/utils';
import { SubHeader } from './SubHeader';

interface AutoHideLogoHeaderProps {
  isVisible?: boolean;
  sticky?: boolean;
  className?: string;
}

export default function AutoHideLogoHeader({
  isVisible,
  sticky = true,
  className,
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
          : 'pointer-events-none -translate-y-full opacity-0',
        className,
      )}
    >
      <SubHeader>
        <SubHeader.Left>
          <SubHeader.Logo />
        </SubHeader.Left>
        <SubHeader.Right>
          <SubHeader.Menu />
        </SubHeader.Right>
      </SubHeader>
    </header>
  );
}
