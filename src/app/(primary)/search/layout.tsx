/* eslint-disable jsx-a11y/click-events-have-key-events */
'use client';

import { usePathname } from 'next/navigation';
import NavLayout from '../_components/NavLayout';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <NavLayout showNavbar={!pathname.includes('/reviews')}>
      {children}
    </NavLayout>
  );
}
