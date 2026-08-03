'use client';

import { useSyncExternalStore } from 'react';
import { UserData } from '@/types/Auth';
import {
  getAuthSnapshot,
  subscribeAuthSession,
  logoutAuthSession,
  refreshAuthSession,
} from '@/lib/auth/session-store';

export const useAuthSession = () => {
  const { status, session } = useSyncExternalStore(
    subscribeAuthSession,
    getAuthSnapshot,
    getAuthSnapshot,
  );

  const user: UserData | null = session?.user ?? null;

  return {
    user,
    isLoggedIn: status === 'authenticated',
    isLoading: status === 'loading',
    logout: logoutAuthSession,
    session,
    refreshSession: refreshAuthSession,
  };
};
