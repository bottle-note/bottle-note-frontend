'use client';

import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useBlockScroll } from '@/hooks/useBlockScroll';

interface Props {
  isShow: boolean;
  children: React.ReactNode;
}

function BackDrop({ isShow, children }: Props) {
  const ModalContents = isShow ? (
    <main className="bg-mainBlack bg-opacity-30 w-full h-full fixed inset-0 z-10">
      {children}
    </main>
  ) : null;
  const { handleScroll } = useBlockScroll();
  const [isBrowser, setIsBrowser] = useState<boolean>(false);

  useEffect(() => {
    setIsBrowser(true);
    handleScroll({ isScroll: false });

    return () => handleScroll({ isScroll: true });
  }, []);

  if (isBrowser) {
    return ReactDOM.createPortal(
      ModalContents,
      document.getElementById('modal') as Element,
    ) as React.ReactNode;
  }

  return null;
}

export default BackDrop;
