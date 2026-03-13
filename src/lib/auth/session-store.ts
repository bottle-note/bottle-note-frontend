'use client';

import { UserData } from '@/types/Auth';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface ClientSession {
  accessToken: string;
  user: UserData;
}

type SessionListener = () => void;

interface SessionSnapshot {
  status: AuthStatus;
  session: ClientSession | null;
}

interface LoginPayload {
  provider: 'kakao-login' | 'apple-login' | 'preview-login';
  accessToken?: string;
  email?: string;
  authorizationCode?: string;
  idToken?: string;
  nonce?: string;
}

let snapshot: SessionSnapshot = {
  status: 'loading',
  session: null,
};

let restorePromise: Promise<ClientSession | null> | null = null;
let refreshPromise: Promise<ClientSession | null> | null = null;

const listeners = new Set<SessionListener>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const setSnapshot = (nextSnapshot: SessionSnapshot) => {
  snapshot = nextSnapshot;
  notify();
};

const requestSession = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<ClientSession | null> => {
  const response = await fetch(input, {
    ...init,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as ClientSession;

  return data?.accessToken ? data : null;
};

export const subscribeAuthSession = (listener: SessionListener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getAuthSnapshot = () => snapshot;

export const setAuthenticatedSession = (session: ClientSession) => {
  setSnapshot({
    status: 'authenticated',
    session,
  });
};

export const clearAuthSession = () => {
  setSnapshot({
    status: 'unauthenticated',
    session: null,
  });
};

export const restoreAuthSession = async () => {
  if (snapshot.status === 'authenticated' && snapshot.session) {
    return snapshot.session;
  }

  if (restorePromise) {
    return restorePromise;
  }

  setSnapshot({
    status: 'loading',
    session: snapshot.session,
  });

  restorePromise = requestSession('/api/auth/session')
    .then((session) => {
      if (session) {
        setAuthenticatedSession(session);
        return session;
      }

      clearAuthSession();
      return null;
    })
    .catch((error) => {
      console.error('Session restore failed:', error);
      clearAuthSession();
      return null;
    })
    .finally(() => {
      restorePromise = null;
    });

  return restorePromise;
};

export const refreshAuthSession = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = requestSession('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({}),
  })
    .then((session) => {
      if (session) {
        setAuthenticatedSession(session);
        return session;
      }

      clearAuthSession();
      return null;
    })
    .catch((error) => {
      console.error('Session refresh failed:', error);
      clearAuthSession();
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

export const loginAuthSession = async (payload: LoginPayload) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(errorBody?.message || 'Login failed');
  }

  const session = (await response.json()) as ClientSession;
  setAuthenticatedSession(session);
  return session;
};

export const logoutAuthSession = async () => {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin',
    });
  } finally {
    clearAuthSession();
  }
};

export const resetAuthSessionForTest = () => {
  snapshot = {
    status: 'loading',
    session: null,
  };
  restorePromise = null;
  refreshPromise = null;
  notify();
};
