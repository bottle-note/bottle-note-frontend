import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sendGTMEvent } from '@next/third-parties/google';
import {
  clearAuthSession,
  resetAuthSessionForTest,
  restoreAuthSession,
  setAuthenticatedSession,
} from '@/lib/auth/session-store';
import { trackGA4Event } from './ga4';

vi.mock('@next/third-parties/google', () => ({ sendGTMEvent: vi.fn() }));

const session = {
  accessToken: 'token',
  user: { userId: 42, sub: 'tester', profile: null },
};
const pushed = () => vi.mocked(sendGTMEvent).mock.calls.map(([data]) => data);
const respondSession = (body: unknown, ok = true) =>
  vi.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok,
    json: async () => body,
  } as Response);

beforeEach(() => {
  vi.mocked(sendGTMEvent).mockClear();
  vi.restoreAllMocks();
  resetAuthSessionForTest();
});

describe('세션 상태의 user_id 전달', () => {
  it('세션 복원에 성공하면 회원 번호를 문자열로 넣는다', async () => {
    respondSession(session);
    await restoreAuthSession();
    expect(pushed()).toEqual([{ event: 'auth_state', user_id: '42' }]);
  });

  it('세션 복원이 실패하면 비회원으로 null을 넣는다', async () => {
    respondSession(null, false);
    await restoreAuthSession();
    expect(pushed()).toEqual([{ event: 'auth_state', user_id: null }]);
  });

  it('세션 확인 중에는 넣지 않는다', () => {
    vi.spyOn(global, 'fetch').mockReturnValueOnce(new Promise(() => {}));
    void restoreAuthSession();
    expect(pushed()).toEqual([]);
  });

  it('로그인 직후 이벤트보다 user_id가 먼저 들어가고, 같은 상태는 다시 넣지 않는다', () => {
    setAuthenticatedSession(session);
    setAuthenticatedSession(session);
    trackGA4Event('login', { method: 'kakao' });

    expect(pushed()).toEqual([
      { event: 'auth_state', user_id: '42' },
      { event: 'login', method: 'kakao' },
    ]);
  });

  it('로그아웃하면 user_id를 null로 비운다', () => {
    setAuthenticatedSession(session);
    clearAuthSession();
    expect(pushed()).toEqual([
      { event: 'auth_state', user_id: '42' },
      { event: 'auth_state', user_id: null },
    ]);
  });
});
