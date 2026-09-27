'use client';

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { usePathname } from 'next/navigation';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { clearReturnToUrl } from '@/utils/loginRedirect';
import { consumeLoginTrigger } from '@/utils/loginTrigger';
import { ClientSession, restoreAuthSession } from './session-store';

type SessionRestoreListener = (session: ClientSession | null) => void;

const SessionRestoreContext = createContext<
  ((listener: SessionRestoreListener) => () => void) | null
>(null);

export function useSessionRestoreSubscription() {
  const subscribe = useContext(SessionRestoreContext);
  if (!subscribe) {
    throw new Error('useSessionRestoreSubscription requires AuthProvider');
  }
  return subscribe;
}

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const pathname = usePathname();
  const { isLoading, isLoggedIn } = useAuthSession();
  const restoreListeners = useRef(new Set<SessionRestoreListener>());
  const subscribeToSessionRestore = useCallback(
    (listener: SessionRestoreListener) => {
      restoreListeners.current.add(listener);
      return () => {
        restoreListeners.current.delete(listener);
      };
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    const handlePageShow = async (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      const session = await restoreAuthSession({ force: true });
      if (cancelled) return;
      restoreListeners.current.forEach((listener) => listener(session));
    };
    window.addEventListener('pageshow', handlePageShow);
    void restoreAuthSession();
    return () => {
      cancelled = true;
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  useEffect(() => {
    if (isLoading || isLoggedIn) return;
    if (
      pathname === '/login' ||
      pathname.startsWith('/oauth/') ||
      pathname === '/agreements'
    ) {
      return;
    }
    // 상단 버튼뿐 아니라 브라우저 뒤로가기로 취소한 로그인도 정리한다.
    clearReturnToUrl();
    consumeLoginTrigger();
  }, [pathname, isLoading, isLoggedIn]);

  return (
    <SessionRestoreContext.Provider value={subscribeToSessionRestore}>
      {children}
    </SessionRestoreContext.Provider>
  );
}
