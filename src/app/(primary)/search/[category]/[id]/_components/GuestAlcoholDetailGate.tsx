'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';

import { GuestLoginPrompt } from '@/components/feature/auth/GuestLoginPrompt';

interface GuestAlcoholDetailGateProps {
  title: string;
  description: string;
  buttonLabel: string;
  onLogin: () => void;
  children: ReactNode;
  id?: string;
}

export function GuestAlcoholDetailGate({
  title,
  description,
  buttonLabel,
  onLogin,
  children,
  id,
}: GuestAlcoholDetailGateProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    content.setAttribute('inert', '');

    return () => content.removeAttribute('inert');
  }, []);

  return (
    <section id={id} className="relative min-h-[260px] overflow-hidden">
      <div
        ref={contentRef}
        aria-hidden="true"
        className="pointer-events-none select-none blur-[3px]"
      >
        {children}
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-10 flex items-end px-5 pb-5"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, var(--color-bg-layer-default) 42%, var(--color-bg-layer-default) 100%)',
        }}
      >
        <div className="w-full">
          <GuestLoginPrompt
            title={title}
            description={description}
            buttonLabel={buttonLabel}
            onLogin={onLogin}
          />
        </div>
      </div>
    </section>
  );
}
