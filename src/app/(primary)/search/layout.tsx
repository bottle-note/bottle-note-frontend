'use client';

import { usePathname } from 'next/navigation';
import NavLayout from '@/components/ui/Layout/NavLayout';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const shouldHideNavbar =
    pathname.includes('/reviews') || pathname.includes('/input');

  return <NavLayout showNavbar={!shouldHideNavbar}>{children}</NavLayout>;
}
