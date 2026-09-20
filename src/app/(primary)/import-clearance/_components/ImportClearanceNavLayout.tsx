'use client';

import { usePathname } from 'next/navigation';
import NavLayout from '@/components/ui/Layout/NavLayout';
import { ROUTES } from '@/constants/routes';

export function ImportClearanceNavLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <NavLayout showNavbar={pathname === ROUTES.IMPORT_CLEARANCE.BASE}>
      {children}
    </NavLayout>
  );
}
