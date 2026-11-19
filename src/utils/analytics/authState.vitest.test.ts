import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sendGTMEvent } from '@next/third-parties/google';
import {
  clearAuthSession,
  getAuthSnapshot,
  resetAuthSessionForTest,
  setAuthenticatedSession,
  subscribeAuthSession,
} from '@/lib/auth/session-store';
import {
  reportAuthSnapshot,
  reportGuestIfUnconfirmed,
  resetAuthStateReportForTest,
} from './authState';

vi.mock('@next/third-parties/google', () => ({ sendGTMEvent: vi.fn() }));

const session = {
  accessToken: 'token',
  user: { userId: 42, sub: 'tester', profile: null },
};

beforeEach(() => {
  vi.mocked(sendGTMEvent).mockClear();
  resetAuthStateReportForTest();
  resetAuthSessionForTest();
});

describe('auth_state', () => {
  it('세션 확인 중에는 보내지 않고 확정되면 회원 번호를 보낸다', () => {
    reportAuthSnapshot(getAuthSnapshot());
    expect(sendGTMEvent).not.toHaveBeenCalled();

    setAuthenticatedSession(session);
    reportAuthSnapshot(getAuthSnapshot());
    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: 'auth_state',
      user_id: '42',
    });
  });

  it('같은 상태는 한 번만 보내고, 로그아웃하면 user_id를 비운다', () => {
    const unsubscribe = subscribeAuthSession(() =>
      reportAuthSnapshot(getAuthSnapshot()),
    );
    setAuthenticatedSession(session);
    setAuthenticatedSession(session);
    clearAuthSession();
    unsubscribe();

    expect(vi.mocked(sendGTMEvent).mock.calls).toEqual([
      [{ event: 'auth_state', user_id: '42' }],
      [{ event: 'auth_state', user_id: null }],
    ]);
  });

  it('세션 확인이 늦으면 비회원으로 먼저 보내고 확정되면 회원 번호를 다시 보낸다', () => {
    reportGuestIfUnconfirmed();
    setAuthenticatedSession(session);
    reportAuthSnapshot(getAuthSnapshot());

    expect(vi.mocked(sendGTMEvent).mock.calls).toEqual([
      [{ event: 'auth_state', user_id: null }],
      [{ event: 'auth_state', user_id: '42' }],
    ]);
  });

  it('이미 확정됐으면 지연 대비 전송을 하지 않는다', () => {
    clearAuthSession();
    reportAuthSnapshot(getAuthSnapshot());
    reportGuestIfUnconfirmed();
    expect(sendGTMEvent).toHaveBeenCalledTimes(1);
  });
});
