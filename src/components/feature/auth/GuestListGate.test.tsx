import { act, fireEvent, render, screen } from '@testing-library/react';
import NavLayout from '@/components/ui/Layout/NavLayout';
import { trackGA4Event } from '@/utils/analytics/ga4';
import { consumeLoginContext } from '@/utils/loginTrigger';
import { GuestListGate } from './GuestListGate';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/explore',
  useSearchParams: () => new URLSearchParams('tab=EXPLORER_WHISKEY'),
}));

jest.mock('@/utils/analytics/ga4', () => ({
  trackGA4Event: jest.fn(),
}));

describe('GuestListGate', () => {
  let intersect: (isIntersecting: boolean) => void;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    sessionStorage.clear();
    window.IntersectionObserver = jest
      .fn()
      .mockImplementation((callback: IntersectionObserverCallback) => {
        intersect = (isIntersecting) =>
          callback(
            [{ isIntersecting } as IntersectionObserverEntry],
            {} as IntersectionObserver,
          );
        return { observe: jest.fn(), disconnect: jest.fn() };
      }) as unknown as typeof IntersectionObserver;
  });

  afterEach(() => jest.useRealTimers());

  const renderGate = () =>
    render(
      <NavLayout showNavbar={false}>
        <GuestListGate
          gatePage="explore_whiskey"
          title="더 많은 위스키가 궁금하신가요?"
          description="로그인하고 나에게 맞는 위스키를 더 찾아보세요."
        />
      </NavLayout>,
    );

  it('게스트가 목록 끝 게이트까지 스크롤한 뒤 로그인하면 단계별 이벤트와 게이트 위치를 남긴다', () => {
    renderGate();

    expect(trackGA4Event).toHaveBeenCalledWith('login_gate_page_view', {
      gate_page: 'explore_whiskey',
    });
    // 관찰 시작 시점에는 게이트가 화면 밖에 있다.
    act(() => intersect(false));
    expect(screen.queryByText('로그인하고 더 보기')).not.toBeInTheDocument();

    act(() => jest.advanceTimersByTime(4000));
    act(() => intersect(true));

    expect(trackGA4Event).toHaveBeenCalledWith('login_gate_reach', {
      gate_page: 'explore_whiskey',
      scrolled_to_reach: true,
      seconds_since_view: 4,
    });

    act(() => jest.advanceTimersByTime(3000));
    fireEvent.click(screen.getByText('로그인하고 더 보기'));

    expect(trackGA4Event).toHaveBeenCalledWith('login_gate_click', {
      gate_page: 'explore_whiskey',
      seconds_since_view: 7,
    });
    expect(mockReplace).toHaveBeenCalledWith(
      `/login?returnTo=${encodeURIComponent('/explore?tab=EXPLORER_WHISKEY')}`,
    );
    expect(consumeLoginContext()).toEqual({
      trigger: undefined,
      gatePage: 'explore_whiskey',
    });
  });

  it('첫 화면에서 이미 보이는 게이트는 스크롤 없이 도달한 것으로 기록한다', () => {
    renderGate();

    act(() => intersect(true));

    expect(trackGA4Event).toHaveBeenCalledWith('login_gate_reach', {
      gate_page: 'explore_whiskey',
      scrolled_to_reach: false,
      seconds_since_view: 0,
    });
  });

  it('게이트가 뷰포트를 다시 지나가도 도달 이벤트는 한 번만 보낸다', () => {
    renderGate();

    act(() => intersect(false));
    act(() => intersect(true));
    act(() => intersect(true));

    const reachCalls = jest
      .mocked(trackGA4Event)
      .mock.calls.filter(([eventName]) => eventName === 'login_gate_reach');
    expect(reachCalls).toHaveLength(1);
  });
});
