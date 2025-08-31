'use client';

import { useAuthInitializer } from '@/hooks/useAuthInitializer';

export const AuthInitializer = () => {
  useAuthInitializer();
  return null;
};
