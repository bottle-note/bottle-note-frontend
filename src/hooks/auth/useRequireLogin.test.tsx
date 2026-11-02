import { act, renderHook } from '@testing-library/react';
import {
  clearAuthSession,
  resetAuthSessionForTest,
  setAuthenticatedSession,
} from '@/lib/auth/session-store';
import { useRequireLogin } from './useRequireLogin';

const replace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

const session = {
  accessToken: 'access-token',
  user: {
    userId: 1,
    sub: 'tester@bottle-note.com',
    profile: null,
    roles: 'ROLE_USER' as const,
  },
};

describe('useRequireLogin', () => {
  beforeEach(() => {
    replace.mockReset();
    resetAuthSessionForTest();
    window.history.replaceState(null, '', '/review/register?alcoholId=12');
  });

  it('비로그인으로 들어오면 지금 주소로 돌아오는 로그인 페이지로 보낸다', () => {
    renderHook(() => useRequireLogin());

    act(() => {
      clearAuthSession();
    });

    expect(replace).toHaveBeenCalledWith(
      '/login?returnTo=%2Freview%2Fregister%3FalcoholId%3D12&required=1',
    );
  });

  it('돌아올 주소를 정하면 그 주소로 돌아오게 한다', () => {
    renderHook(() => useRequireLogin('/notifications'));

    act(() => {
      clearAuthSession();
    });

    expect(replace).toHaveBeenCalledWith(
      '/login?returnTo=%2Fnotifications&required=1',
    );
  });

  it('로그인 상태를 확인하는 동안과 로그인한 뒤에는 보내지 않는다', () => {
    renderHook(() => useRequireLogin());
    expect(replace).not.toHaveBeenCalled();

    act(() => {
      setAuthenticatedSession(session);
    });

    expect(replace).not.toHaveBeenCalled();
  });
});
