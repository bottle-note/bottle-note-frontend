import { act, render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import AppStorePrompt from './AppStorePrompt';
import {
  APP_STORE_PROMPT_DETAIL_VIEW_COUNT_KEY,
  APP_STORE_PROMPT_SESSION_KEY,
} from './appStorePromptPolicy';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('@/hooks/auth/useAuthSession', () => ({
  useAuthSession: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseAuthSession = useAuthSession as jest.MockedFunction<
  typeof useAuthSession
>;

const createAuthSession = ({
  isLoggedIn,
  isLoading,
}: {
  isLoggedIn: boolean;
  isLoading: boolean;
}): ReturnType<typeof useAuthSession> => ({
  user: isLoggedIn ? ({ userId: 1 } as never) : null,
  isLoggedIn,
  isLoading,
  logout: jest.fn(),
  session: null,
  refreshSession: jest.fn(),
});

const flushEffects = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

describe('AppStorePrompt 로그인 노출 조건', () => {
  const originalUserAgent = window.navigator.userAgent;

  beforeAll(() => {
    Object.defineProperty(window.navigator, 'userAgent', {
      configurable: true,
      value:
        'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/140.0.0.0 Mobile Safari/537.36',
    });
  });

  afterAll(() => {
    Object.defineProperty(window.navigator, 'userAgent', {
      configurable: true,
      value: originalUserAgent,
    });
  });

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.isInApp = false;
    mockUsePathname.mockReturnValue('/alcohols/123');
  });

  it('게스트는 상세 화면에 진입해도 카운트를 늘리거나 배너를 노출하지 않는다', async () => {
    localStorage.setItem(APP_STORE_PROMPT_DETAIL_VIEW_COUNT_KEY, '2');
    mockUseAuthSession.mockReturnValue(
      createAuthSession({ isLoggedIn: false, isLoading: false }),
    );

    render(<AppStorePrompt />);
    await flushEffects();

    expect(localStorage.getItem(APP_STORE_PROMPT_DETAIL_VIEW_COUNT_KEY)).toBe(
      '2',
    );
    expect(sessionStorage.getItem(APP_STORE_PROMPT_SESSION_KEY)).toBeNull();
    expect(
      screen.queryByLabelText('BottleNote 앱 안내'),
    ).not.toBeInTheDocument();
  });

  it('인증 복원 중에는 집계하지 않고 로그인 확인 후 현재 상세를 집계한다', async () => {
    localStorage.setItem(APP_STORE_PROMPT_DETAIL_VIEW_COUNT_KEY, '2');
    mockUseAuthSession.mockReturnValue(
      createAuthSession({ isLoggedIn: false, isLoading: true }),
    );

    const { rerender } = render(<AppStorePrompt />);
    await flushEffects();

    expect(localStorage.getItem(APP_STORE_PROMPT_DETAIL_VIEW_COUNT_KEY)).toBe(
      '2',
    );

    mockUseAuthSession.mockReturnValue(
      createAuthSession({ isLoggedIn: true, isLoading: false }),
    );
    rerender(<AppStorePrompt />);

    expect(await screen.findByLabelText('BottleNote 앱 안내')).toBeVisible();
    expect(localStorage.getItem(APP_STORE_PROMPT_DETAIL_VIEW_COUNT_KEY)).toBe(
      '3',
    );
    expect(sessionStorage.getItem(APP_STORE_PROMPT_SESSION_KEY)).toBe('true');
  });
});
