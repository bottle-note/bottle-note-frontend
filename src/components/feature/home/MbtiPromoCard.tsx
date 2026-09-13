'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

import { ROUTES } from '@/constants/routes';
import { Storage } from '@/lib/Storage';

export const MBTI_PROMO_CLOSED_KEY = 'homeMbtiPromoClosed';

export function MbtiPromoCard() {
  const [show, setShow] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (Storage.getItem<boolean>(MBTI_PROMO_CLOSED_KEY)) {
      return undefined;
    }

    setShow(true);
    const timer = setTimeout(() => setIsVisible(true), 300);

    return () => {
      clearTimeout(timer);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const handleClose = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    Storage.setItem(MBTI_PROMO_CLOSED_KEY, true);
    setIsVisible(false);
    closeTimerRef.current = setTimeout(() => setShow(false), 500);
  };

  if (!show) return null;

  return (
    <div
      className={`
        mx-4 mt-0 overflow-hidden transition-all duration-500 ease-out
        ${isVisible ? 'mb-[15px] max-h-24 opacity-100' : 'mb-0 max-h-0 opacity-0'}
      `}
    >
      <Link
        href={ROUTES.WHISKEY_MBTI}
        prefetch={false}
        className="relative block rounded-xl bg-bg-brand-weak p-4"
      >
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 text-fg-neutral-subtle hover:text-fg-neutral-muted"
          aria-label="닫기"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="pr-8">
          <h3 className="text-base font-semibold text-fg-brand-primary">
            나를 닮은 위스키 MBTI
          </h3>
          <p className="mt-1 text-sm text-fg-neutral-muted">
            내 취향과 어울리는 위스키를 찾아보세요.
          </p>
        </div>
      </Link>
    </div>
  );
}
