'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useBlockScroll } from '@/hooks/useBlockScroll';
import { cn } from '@/lib/utils';

interface Props {
  isShow: boolean;
  isModal?: boolean;
  children: React.ReactNode;
  onBackdropClick?: () => void;
  className?: string;
}

function BackDrop({
  isShow,
  isModal = true,
  children,
  onBackdropClick,
  className,
}: Props) {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onBackdropClick) {
      onBackdropClick();
    }
  };
  const ModalContents = (
    <div
      className={cn(
        'fixed inset-0 z-40',
        isModal && 'bg-bg-overlay',
        isShow ? 'block' : 'hidden',
        className,
      )}
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && onBackdropClick) {
          onBackdropClick();
        }
      }}
    >
      {children}
    </div>
  );

  const { handleScroll } = useBlockScroll();
  const [isBrowser, setIsBrowser] = useState<boolean>(false);

  useEffect(() => {
    if (isShow) {
      setIsBrowser(true);
      handleScroll({ isScroll: false });
    }

    return () => {
      handleScroll({ isScroll: true });
    };
  }, [isShow]);

  if (isBrowser) {
    return createPortal(
      ModalContents,
      document.getElementById('modal') as Element,
    ) as React.ReactNode;
  }

  return null;
}

export default BackDrop;
