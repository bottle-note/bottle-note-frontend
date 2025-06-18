'use client';
import { useEffect } from 'react';

export function FocusScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    function handleFocus(e: FocusEvent) {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
      ) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 200);
      }
    }
    document.addEventListener('focusin', handleFocus);
    return () => {
      document.removeEventListener('focusin', handleFocus);
    };
  }, []);

  return <>{children}</>;
}
