import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import LoginPage from '@/app/(custom)/login/page';
import LoginModal from '@/components/domain/auth/LoginModal';
import { useLoginBridge } from '@/hooks/useLoginBridge';
import { clearAuthSession } from '@/lib/auth/session-store';
import { trackGA4Event } from '@/utils/analytics/ga4';
import { consumeLoginTrigger } from '@/utils/loginTrigger';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));
jest.mock('@/utils/analytics/ga4', () => ({ trackGA4Event: jest.fn() }));
jest.mock('@/components/ui/Modal/BackDrop', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const sourceUrl =
  '/explore?tab=EXPLORER_WHISKEY&keywords=macallan&regionIds=12';

function LoginCta({ returnTo }: { returnTo?: string }) {
  const { bridgeToLogin } = useLoginBridge();
  return (
    <button type="button" onClick={() => bridgeToLogin({ returnTo })}>
      로그인 CTA
    </button>
  );
}

// Next router의 이동을 화면에 반영한다. 실제 브라우저 히스토리는 별도로 검증한다.
function NavigationHarness({
  entry,
  returnTo,
}: {
  entry: 'modal' | 'cta';
  returnTo?: string;
}) {
  const [url, setUrl] = useState(sourceUrl);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const parsed = new URL(url, 'https://bottlenote.local');
  jest.mocked(usePathname).mockReturnValue(parsed.pathname);
  jest
    .mocked(useSearchParams)
    .mockReturnValue(
      new URLSearchParams(parsed.search) as ReturnType<typeof useSearchParams>,
    );
  jest.mocked(useRouter).mockReturnValue({
    replace: setUrl,
    push: setUrl,
    back: jest.fn(),
  } as unknown as ReturnType<typeof useRouter>);

  return (
    <>
      <output aria-label="현재 경로">{url}</output>
      {parsed.pathname === '/login' ? (
        <LoginPage />
      ) : (
        <>
          <h1>복귀 화면</h1>
          {entry === 'modal' && isModalOpen && (
            <LoginModal
              handleClose={() => setIsModalOpen(false)}
              returnTo={returnTo}
            />
          )}
          {entry === 'cta' && <LoginCta returnTo={returnTo} />}
        </>
      )}
    </>
  );
}

describe('로그인 진입과 상단 뒤로가기', () => {
  const replace = jest.fn();
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    window.history.replaceState(null, '', '/');
    window.isInApp = false;
    clearAuthSession();
    jest.mocked(usePathname).mockReturnValue('/explore');
    jest
      .mocked(useSearchParams)
      .mockReturnValue(
        new URLSearchParams(
          new URL(sourceUrl, 'https://bottlenote.local').search,
        ) as ReturnType<typeof useSearchParams>,
      );
    jest
      .mocked(useRouter)
      .mockReturnValue({ replace, push } as unknown as ReturnType<
        typeof useRouter
      >);
  });

  it('모달 로그인은 현재 경로와 query를 returnTo로 전달하고 현재 기록을 교체한다', () => {
    const handleClose = jest.fn();
    render(<LoginModal handleClose={handleClose} />);
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));
    expect(replace).toHaveBeenCalledWith(
      `/login?returnTo=${encodeURIComponent(sourceUrl)}`,
    );
    expect(push).not.toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(trackGA4Event).not.toHaveBeenCalled();
  });

  it.each(['modal', 'cta'] as const)(
    '%s 진입 후 상단 뒤로가기는 query를 포함한 returnTo 화면으로 복귀한다',
    (entry) => {
      render(<NavigationHarness entry={entry} />);
      fireEvent.click(
        screen.getByRole('button', {
          name: entry === 'modal' ? '로그인' : '로그인 CTA',
        }),
      );
      expect(screen.getByLabelText('현재 경로')).toHaveTextContent('/login?');
      expect(screen.getByText('카카오 로그인')).toBeVisible();
      fireEvent.click(screen.getByRole('button', { name: 'arrowIcon' }));
      expect(screen.getByLabelText('현재 경로')).toHaveTextContent(sourceUrl);
      expect(screen.getByRole('heading', { name: '복귀 화면' })).toBeVisible();
      expect(screen.queryByText('카카오 로그인')).not.toBeInTheDocument();
    },
  );

  it.each(['modal', 'cta'] as const)(
    '%s에서 명시한 목적지는 로그인 취소 시에도 그대로 사용한다',
    (entry) => {
      render(<NavigationHarness entry={entry} returnTo="/inquire/register" />);
      fireEvent.click(
        screen.getByRole('button', {
          name: entry === 'modal' ? '로그인' : '로그인 CTA',
        }),
      );
      fireEvent.click(screen.getByRole('button', { name: 'arrowIcon' }));
      expect(screen.getByLabelText('현재 경로')).toHaveTextContent(
        '/inquire/register',
      );
    },
  );

  it('모달 닫기가 URL을 바꾸어도 닫기 전 query를 복귀 경로로 전달한다', () => {
    render(
      <LoginModal
        handleClose={() => {
          window.history.replaceState(null, '', '/explore');
        }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));
    expect(replace).toHaveBeenCalledWith(
      `/login?returnTo=${encodeURIComponent(sourceUrl)}`,
    );
  });

  it('유효하지 않은 목적지는 홈으로 복귀한다', () => {
    render(<NavigationHarness entry="modal" returnTo="https://example.com" />);
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));
    fireEvent.click(screen.getByRole('button', { name: 'arrowIcon' }));
    expect(screen.getByLabelText('현재 경로').textContent).toBe('/');
  });

  it('MBTI 결과 경로도 상단 뒤로가기에서 returnTo를 그대로 사용한다', () => {
    const returnTo = '/whiskey-mbti?result=ENFP';
    render(<NavigationHarness entry="modal" returnTo={returnTo} />);
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));
    fireEvent.click(screen.getByRole('button', { name: 'arrowIcon' }));
    expect(screen.getByLabelText('현재 경로')).toHaveTextContent(returnTo);
  });

  it('기존 trigger가 있는 CTA는 유도 이벤트를 한 번 기록한다', () => {
    function RatingCta() {
      const { bridgeToLogin } = useLoginBridge();
      return (
        <button
          type="button"
          onClick={() => bridgeToLogin({ trigger: 'rating' })}
        >
          별점 기록
        </button>
      );
    }
    render(<RatingCta />);
    fireEvent.click(screen.getByRole('button', { name: '별점 기록' }));
    expect(trackGA4Event).toHaveBeenCalledTimes(1);
    expect(trackGA4Event).toHaveBeenCalledWith('login_prompt_shown', {
      trigger: 'rating',
    });
    expect(consumeLoginTrigger()).toBe('rating');
  });
});
