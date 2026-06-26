'use client';

import { usePathname } from 'next/navigation';
import NavLayout from '@/components/ui/Layout/NavLayout';
import { ROUTES } from '@/constants/routes';

export function CurationNavLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <NavLayout showNavbar={pathname === ROUTES.CURATION.BASE}>
      {children}
    </NavLayout>
  );
}
