'use client';

import { useSyncExternalStore } from 'react';
import { UserData } from '@/types/Auth';
import {
  getAuthSnapshot,
  subscribeAuthSession,
  loginAuthSession,
  logoutAuthSession,
  refreshAuthSession,
} from '@/lib/auth/session-store';

export const useAuth = () => {
  const { status, session } = useSyncExternalStore(
    subscribeAuthSession,
    getAuthSnapshot,
    getAuthSnapshot,
  );

  const user: UserData | null = session?.user ?? null;
  const isLoggedIn = status === 'authenticated';
  const isLoading = status === 'loading';

  const logout = () => {
    return logoutAuthSession();
  };

  const login = async (
    provider: 'kakao-login' | 'apple-login' | 'preview-login',
    credentials: Record<string, any>,
  ) => {
    await loginAuthSession({
      provider,
      ...credentials,
    });
  };

  return {
    user,
    isLoggedIn,
    isLoading,
    logout,
    login,
    session,
    refreshSession: refreshAuthSession,
  };
};
