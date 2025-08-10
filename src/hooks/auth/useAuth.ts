'use client';

import { useSession, signOut, signIn } from 'next-auth/react';
import { useMemo } from 'react';
import { UserData } from '@/types/Auth';

export const useAuth = () => {
  const { data: session, status, update } = useSession();

  const user = useMemo((): UserData | null => {
    if (session?.user) {
      return {
        userId: session.user.userId,
        sub: session.user.email,
        profile: session.user.profile,
        roles: session.user.roles as 'ROLE_USER' | 'ROLE_ADMIN' | undefined,
      };
    }
    return null;
  }, [session]);

  const isLoggedIn = status === 'authenticated';
  const isLoading = status === 'loading';

  const logout = () => {
    signOut({ redirect: false });
  };

  // FIXME: 로그인 provider id 타입 안정성 강화 (ex kakao-login,,)
  const login = async (
    provider: 'kakao-login' | 'apple-login',
    credentials: Record<string, any>,
    isRedirect = false,
  ) => {
    await signIn(provider, {
      ...credentials,
      redirect: isRedirect,
    });
  };

  return {
    user,
    isLoggedIn,
    isLoading,
    logout,
    login,
    session,
    updateSession: update,
  };
};
