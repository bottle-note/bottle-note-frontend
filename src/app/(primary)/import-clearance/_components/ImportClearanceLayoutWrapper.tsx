'use client';

import { ImportClearanceNavLayout } from './ImportClearanceNavLayout';

export function ImportClearanceLayoutWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ImportClearanceNavLayout>{children}</ImportClearanceNavLayout>;
}
