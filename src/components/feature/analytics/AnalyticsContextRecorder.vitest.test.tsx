import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import { sendGTMEvent } from '@next/third-parties/google';
import {
  resetAuthSessionForTest,
  setAuthenticatedSession,
} from '@/lib/auth/session-store';
import {
  AUTH_STATE_FALLBACK_MS,
  resetAuthStateReportForTest,
} from '@/utils/analytics/authState';
import { trackGA4Event } from '@/utils/analytics/ga4';
import { getAlcoholDetailEntrySource } from '@/utils/analytics/screenHistory';
import { AnalyticsContextRecorder } from './AnalyticsContextRecorder';

vi.mock('@next/third-parties/google', () => ({ sendGTMEvent: vi.fn() }));
const navigation = vi.hoisted(() => ({ pathname: '/', search: '' }));
vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useSearchParams: () => new URLSearchParams(navigation.search),
}));

const session = {
  accessToken: 'token',
  user: { userId: 7, sub: 'tester', profile: null },
};
const pushedEvents = () =>
  vi.mocked(sendGTMEvent).mock.calls.map(([data]) => data);

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(sendGTMEvent).mockClear();
  sessionStorage.clear();
  resetAuthStateReportForTest();
  resetAuthSessionForTest();
  navigation.pathname = '/';
  navigation.search = '';
});
afterEach(() => vi.useRealTimers());

describe('AnalyticsContextRecorder', () => {
  it('로그인 직후 보내는 이벤트보다 auth_state가 먼저 들어간다', () => {
    render(<AnalyticsContextRecorder />);
    act(() => setAuthenticatedSession(session));
    trackGA4Event('login', { method: 'kakao' });

    expect(pushedEvents()).toEqual([
      { event: 'auth_state', user_id: '7' },
      { event: 'login', method: 'kakao' },
    ]);
  });

  it('세션 확인이 늦어지면 page_view가 빠지지 않게 비회원 auth_state를 보낸다', () => {
    render(<AnalyticsContextRecorder />);
    expect(pushedEvents()).toEqual([]);

    act(() => vi.advanceTimersByTime(AUTH_STATE_FALLBACK_MS));
    expect(pushedEvents()).toEqual([{ event: 'auth_state', user_id: null }]);
  });

  it('화면 이동을 기록해 술 상세의 직전 화면을 알 수 있다', () => {
    navigation.pathname = '/explore';
    navigation.search = 'tab=EXPLORER_WHISKEY';
    const { rerender } = render(<AnalyticsContextRecorder />);
    navigation.pathname = '/alcohols/3';
    navigation.search = '';
    rerender(<AnalyticsContextRecorder />);

    expect(getAlcoholDetailEntrySource('/alcohols/3')).toBe('search');
  });
});
