'use client';

import { ReactNode, useEffect } from 'react';
import { restoreAuthSession } from './session-store';

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  useEffect(() => {
    void restoreAuthSession();
  }, []);

  return <>{children}</>;
}
