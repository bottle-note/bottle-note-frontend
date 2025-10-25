'use client';

import { usePathname } from 'next/navigation';
import NavLayout from '@/components/ui/Layout/NavLayout';

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
