'use client';

import { useSession, signOut } from 'next-auth/react';
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

  const logout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return {
    user,
    isLoggedIn,
    isLoading,
    logout,
    session,
    updateSession: update,
  };
};
