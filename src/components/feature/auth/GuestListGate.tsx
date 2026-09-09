'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { ROUTES } from '@/constants/routes';
import { useNavLayout } from '@/components/ui/Layout/NavLayout';
import { GuestLoginPrompt } from './GuestLoginPrompt';

export const GUEST_LIST_PAGE_SIZE = 3;

interface GuestListGateProps {
  title: string;
  description: string;
}

export function GuestListGate({ title, description }: GuestListGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isNavbarSuppressed, isNavigationVisible } = useNavLayout();
  const [isActive, setIsActive] = useState(false);
  const gateRef = useRef<HTMLDivElement>(null);
  const isNavbarVisible = isNavigationVisible && !isNavbarSuppressed;

  useEffect(() => {
    const gate = gateRef.current;
    if (!gate) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;

      setIsActive(true);
      observer.disconnect();
    });

    observer.observe(gate);

    return () => observer.disconnect();
  }, []);

  const handleLogin = () => {
    const query = searchParams.toString();
    const returnTo = query ? `${pathname}?${query}` : pathname;

    router.push(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(returnTo)}`);
  };

  return (
    <>
      <div ref={gateRef} aria-hidden="true" className="h-24" />
      {isActive && (
        <>
          <div
            aria-hidden="true"
            className="fixed-content pointer-events-none bottom-0 z-[9] h-[60vh]"
            style={{
              background:
                'linear-gradient(to bottom, transparent 0%, var(--color-bg-layer-default) 58%, var(--color-bg-layer-default) 100%)',
            }}
          />
          <div
            className="fixed-content pointer-events-none z-20 px-5 text-center transition-[bottom] duration-300"
            style={{
              bottom: isNavbarVisible
                ? 'calc(var(--navbar-total-space) + 16px)'
                : 'var(--navbar-margin-bottom)',
            }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 -bottom-6 -top-16 -z-10"
              style={{
                background:
                  'linear-gradient(to bottom, transparent 0%, var(--color-bg-layer-default) 48px, var(--color-bg-layer-default) 100%)',
              }}
            />
            <GuestLoginPrompt
              title={title}
              description={description}
              buttonLabel="로그인하고 더 보기"
              onLogin={handleLogin}
            />
          </div>
        </>
      )}
    </>
  );
}
