import type { ReactNode } from 'react';
import ContentWidth from '@/components/ui/Layout/ContentWidth';

export default function Layout({ children }: { children: ReactNode }) {
  return <ContentWidth size="form">{children}</ContentWidth>;
}
