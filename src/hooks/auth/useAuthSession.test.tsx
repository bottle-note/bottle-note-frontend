import { act, renderHook } from '@testing-library/react';
import {
  getAuthSnapshot,
  resetAuthSessionForTest,
  setAuthenticatedSession,
} from '@/lib/auth/session-store';
import { useAuthSession } from './useAuthSession';

const session = {
  accessToken: 'access-token',
  user: {
    userId: 1,
    sub: 'tester@bottle-note.com',
    profile: null,
    roles: 'ROLE_USER' as const,
  },
};

describe('useAuthSession', () => {
  const fetchMock = jest.fn();

  beforeAll(() => {
    global.fetch = fetchMock as typeof fetch;
  });

  beforeEach(() => {
    fetchMock.mockReset();
    resetAuthSessionForTest();
  });

  it('인증 세션이 저장되면 로그인 상태와 사용자 정보를 제공한다', () => {
    const { result } = renderHook(() => useAuthSession());

    act(() => {
      setAuthenticatedSession(session);
    });

    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toEqual(session.user);
    expect(result.current).not.toHaveProperty('login');
  });

  it('로그아웃하면 서버 세션을 제거하고 비인증 상태가 된다', async () => {
    setAuthenticatedSession(session);
    fetchMock.mockResolvedValueOnce({ ok: true } as Response);
    const { result } = renderHook(() => useAuthSession());

    await act(async () => {
      await result.current.logout();
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin',
    });
    expect(getAuthSnapshot()).toEqual({
      status: 'unauthenticated',
      session: null,
    });
  });
});
