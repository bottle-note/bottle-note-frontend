import { ComponentType, useState } from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import LoginPage from '@/app/(custom)/login/page';
import { AuthProvider } from '@/lib/auth/AuthProvider';
import {
  clearAuthSession,
  resetAuthSessionForTest,
  setAuthenticatedSession,
} from '@/lib/auth/session-store';
import type { MbtiResultDetail } from '../_types';
import MbtiExperience from './MbtiExperience';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (loader: () => Promise<{ default: ComponentType }>) => {
    const React = jest.requireActual<typeof import('react')>('react');
    const Component = React.lazy(loader);
    return function DynamicComponent(props: Record<string, unknown>) {
      return (
        <React.Suspense fallback={null}>
          <Component {...props} />
        </React.Suspense>
      );
    };
  },
}));

const session = {
  accessToken: 'test-access-token',
  user: {
    userId: 1,
    sub: 'tester@bottle-note.com',
    profile: null,
    roles: 'ROLE_USER' as const,
  },
};

const result: MbtiResultDetail = {
  code: 'INTJ-A',
  type: 'INTJ',
  taste: 'A',
  tasteLabel: '테스트 취향',
  tone: '#123456',
  title: '나를 닮은 위스키',
  reason: '테스트 결과 설명',
  dramCopy: '테스트 추천 설명',
  characterImage: '/images/whiskey-mbti/test.png',
  whisky: {
    id: null,
    name: '테스트 위스키',
    imageUrl: null,
    rating: null,
    ratingCount: null,
    tags: [],
    detailAvailable: false,
  },
};

function NavigationHarness({ initialUrl }: { initialUrl: string }) {
  const [url, setUrl] = useState(initialUrl);
  const parsed = new URL(url, window.location.origin);
  jest.mocked(usePathname).mockReturnValue(parsed.pathname);
  jest
    .mocked(useSearchParams)
    .mockReturnValue(
      new URLSearchParams(parsed.search) as ReturnType<typeof useSearchParams>,
    );
  jest.mocked(useRouter).mockReturnValue({
    replace: setUrl,
    back: jest.fn(),
  } as unknown as ReturnType<typeof useRouter>);

  return (
    <>
      <output aria-label="현재 경로">{url}</output>
      {parsed.pathname === '/login' ? (
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      ) : (
        <MbtiExperience />
      )}
    </>
  );
}

describe('MBTI 결과 인증과 복귀', () => {
  const fetchMock = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    window.history.replaceState(null, '', '/');
    window.isInApp = false;
    window.scrollTo = jest.fn();
    document.body.innerHTML = '<div id="modal"></div>';
    clearAuthSession();
    global.fetch = fetchMock;
    fetchMock.mockResolvedValue({ ok: true, json: async () => result });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const renderFlow = (initialUrl = '/whiskey-mbti?result=INTJ-A') => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <NavigationHarness initialUrl={initialUrl} />
      </QueryClientProvider>,
    );
  };

  it('비로그인으로 본인 결과에 복귀하면 결과 주소를 지우고 첫 화면으로 초기화한다', async () => {
    renderFlow();
    expect(
      await screen.findByRole('button', { name: '테스트 시작하기' }),
    ).toBeVisible();
    expect(screen.getByLabelText('현재 경로')).toHaveTextContent(
      /^\/whiskey-mbti$/,
    );
    expect(
      screen.queryByRole('heading', { name: result.title }),
    ).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('세션 확인 중에는 본인 결과를 요청하지 않고, 인증이 확인되면 결과를 보여준다', async () => {
    resetAuthSessionForTest();
    renderFlow();
    expect(screen.getByText('로그인 상태를 확인하는 중이에요.')).toBeVisible();
    expect(fetchMock).not.toHaveBeenCalled();
    act(() => setAuthenticatedSession(session));
    expect(
      await screen.findByRole('heading', { name: result.title }),
    ).toBeVisible();
    expect(screen.getByLabelText('현재 경로')).toHaveTextContent(
      '/whiskey-mbti?result=INTJ-A',
    );
  });

  it('세션 확인 결과가 비로그인이면 본인 결과를 요청하지 않고 초기화한다', async () => {
    resetAuthSessionForTest();
    renderFlow();
    act(() => clearAuthSession());
    expect(
      await screen.findByRole('button', { name: '테스트 시작하기' }),
    ).toBeVisible();
    expect(screen.getByLabelText('현재 경로')).toHaveTextContent(
      /^\/whiskey-mbti$/,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('결과를 보던 중 세션이 없어지면 결과를 숨기고 첫 화면으로 돌아간다', async () => {
    setAuthenticatedSession(session);
    renderFlow();
    await screen.findByRole('heading', { name: result.title });
    act(() => clearAuthSession());
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: result.title }),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole('button', { name: '테스트 시작하기' }),
    ).toBeVisible();
    expect(screen.getByLabelText('현재 경로')).toHaveTextContent(
      /^\/whiskey-mbti$/,
    );
  });

  it('공유 결과는 비로그인 상태에서도 볼 수 있다', async () => {
    renderFlow('/whiskey-mbti?result=INTJ-A&shared=1');
    expect(
      await screen.findByRole('heading', { name: result.title }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: '로그인 후 나도 테스트하기' }),
    ).toBeVisible();
    expect(screen.getByLabelText('현재 경로')).toHaveTextContent(
      '/whiskey-mbti?result=INTJ-A&shared=1',
    );
  });

  it('로그인 상단 뒤로가기로 본인 결과에 복귀해도 MBTI 화면에서 초기화한다', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 401 });
    renderFlow(
      `/login?returnTo=${encodeURIComponent('/whiskey-mbti?result=INTJ-A')}`,
    );
    fireEvent.click(await screen.findByRole('button', { name: 'arrowIcon' }));
    expect(
      await screen.findByRole('button', { name: '테스트 시작하기' }),
    ).toBeVisible();
    expect(screen.getByLabelText('현재 경로')).toHaveTextContent(
      /^\/whiskey-mbti$/,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/session',
      expect.anything(),
    );
  });
});
