import { fireEvent, render, screen } from '@testing-library/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useRequireLogin } from '@/hooks/auth/useRequireLogin';
import { useLoginBridge } from '@/hooks/useLoginBridge';
import {
  clearAuthSession,
  resetAuthSessionForTest,
} from '@/lib/auth/session-store';
import LoginPage from './page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));

const router = { replace: jest.fn(), push: jest.fn(), back: jest.fn() };

// 테스트 환경에는 실제 페이지 이동이 없으므로, 라우터가 받은 주소로 현재 주소를 바꿔 이동을 흉내 낸다
const visit = (url: string) => {
  window.history.pushState(null, '', url);
  const { pathname, search } = window.location;
  (usePathname as jest.Mock).mockReturnValue(pathname);
  (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(search));
};
const replaceWith = (url: string) => {
  window.history.replaceState(null, '', url);
  (usePathname as jest.Mock).mockReturnValue(window.location.pathname);
  (useSearchParams as jest.Mock).mockReturnValue(
    new URLSearchParams(window.location.search),
  );
};

function HistoryPage() {
  useRequireLogin();
  return <p>나의 기록</p>;
}

function AlcoholDetailPage() {
  const { bridgeToLogin } = useLoginBridge();
  return (
    <button type="button" onClick={() => bridgeToLogin({ trigger: 'rating' })}>
      별점 남기기
    </button>
  );
}

const pressLoginBack = () =>
  fireEvent.click(screen.getByRole('button', { name: 'arrowIcon' }));

describe('로그인 화면 상단 뒤로가기', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    resetAuthSessionForTest();
    clearAuthSession();
    (useRouter as jest.Mock).mockReturnValue(router);
  });

  it('비로그인으로 나의 기록에 들어가 로그인을 취소하면 나의 기록이 아니라 보던 화면으로 돌아간다', () => {
    visit('/explore');
    visit('/history');
    const { unmount } = render(<HistoryPage />);
    const loginUrl = router.replace.mock.calls[0][0];
    unmount();

    replaceWith(loginUrl);
    render(<LoginPage />);
    pressLoginBack();

    expect(router.back).toHaveBeenCalledTimes(1);
    expect(router.replace).not.toHaveBeenCalledWith('/history');
  });

  it('공개 화면에서 로그인하러 왔다가 취소하면 그 화면으로 돌아간다', () => {
    visit('/alcohols/12');
    const { unmount } = render(<AlcoholDetailPage />);
    fireEvent.click(screen.getByRole('button', { name: '별점 남기기' }));
    const loginUrl = router.replace.mock.calls[0][0];
    unmount();

    replaceWith(loginUrl);
    render(<LoginPage />);
    router.replace.mockClear();
    pressLoginBack();

    expect(router.replace).toHaveBeenCalledWith('/alcohols/12');
    expect(router.back).not.toHaveBeenCalled();
  });
});
