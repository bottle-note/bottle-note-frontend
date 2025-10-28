'use client';

import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useBlockScroll } from '@/hooks/useBlockScroll';

interface Props {
  isShow: boolean;
  isModal?: boolean;
  children: React.ReactNode;
  onBackdropClick?: () => void;
}

function BackDrop({
  isShow,
  isModal = true,
  children,
  onBackdropClick,
}: Props) {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onBackdropClick) {
      onBackdropClick();
    }
  };
  const ModalContents = (
    <div
      className={`fixed inset-0  z-40 ${isModal && 'bg-black/60'} ${isShow ? 'block' : 'hidden'}`}
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
    return ReactDOM.createPortal(
      ModalContents,
      document.getElementById('modal') as Element,
    ) as React.ReactNode;
  }

  return null;
}

export default BackDrop;
