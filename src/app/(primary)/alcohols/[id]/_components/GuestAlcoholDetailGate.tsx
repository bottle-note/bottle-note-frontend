'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';

import { GuestLoginPrompt } from '@/components/feature/auth/GuestLoginPrompt';
import { GUEST_GATED_CONTENT_CLASS } from '../_constants';

interface GuestAlcoholDetailGateProps {
  title: string;
  description: string;
  buttonLabel: string;
  onLogin: () => void;
  children: ReactNode;
  id?: string;
  isAuthLoading?: boolean;
}

export function GuestAlcoholDetailGate({
  title,
  description,
  buttonLabel,
  onLogin,
  children,
  id,
  isAuthLoading = false,
}: GuestAlcoholDetailGateProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    content.setAttribute('inert', '');

    return () => content.removeAttribute('inert');
  }, []);

  return (
    <section
      id={id}
      className="relative flex min-h-0 flex-col justify-end overflow-hidden"
    >
      <div
        ref={contentRef}
        aria-hidden="true"
        className={`${GUEST_GATED_CONTENT_CLASS} pointer-events-none absolute inset-0 select-none blur-[1px]`}
      >
        {children}
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, var(--color-bg-layer-default) 42%, var(--color-bg-layer-default) 100%)',
        }}
      />
      <div className="pointer-events-none relative z-10 w-full bg-bg-layer-default px-20 py-20">
        {isAuthLoading ? (
          <div aria-hidden="true" className="h-88 animate-pulse" />
        ) : (
          <GuestLoginPrompt
            title={title}
            description={description}
            buttonLabel={buttonLabel}
            onLogin={onLogin}
          />
        )}
      </div>
    </section>
  );
}
