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
import type {
  LoginCredentialsByProvider,
  LoginPayload,
  LoginProvider,
} from '@/lib/auth/login-payload';

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

  const login = async <Provider extends LoginProvider>(
    provider: Provider,
    credentials: LoginCredentialsByProvider[Provider],
  ) => {
    await loginAuthSession({ provider, ...credentials } as LoginPayload);
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
