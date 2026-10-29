import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import type { Alcohol } from '@/api/alcohol/types';
import { ROUTES } from '@/constants/routes';
import useModalStore from '@/store/modalStore';
import { trackGA4Event } from '@/utils/analytics/ga4';
import HomeQuickLinks from './HomeQuickLinks';
import HomeFeaturedSection from './HomeFeaturedSection';

const { authState } = vi.hoisted(() => ({
  authState: { isLoggedIn: false },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('@/hooks/auth/useAuthSession', () => ({
  useAuthSession: () => ({
    user: authState.isLoggedIn ? { userId: 1 } : null,
    isLoggedIn: authState.isLoggedIn,
    isLoading: false,
  }),
}));
vi.mock('@/utils/analytics/ga4', () => ({ trackGA4Event: vi.fn() }));
vi.mock('@/api/alcohol/alcohol.api', () => ({
  AlcoholsApi: {
    getWeeklyViewPopular: vi.fn(),
    getHistory: vi.fn(),
    putPick: vi.fn(),
  },
}));

const alcohol = (id: number, korName: string): Alcohol => ({
  alcoholId: id,
  korName,
  engName: `ENG ${id}`,
  rating: 3.5,
  ratingCount: 10,
  korCategory: '싱글 몰트',
  engCategory: 'Single Malt',
  imageUrl: '',
  isPicked: false,
});

const weeklyTop = [
  alcohol(11, '스프링뱅크 10년'),
  alcohol(12, '크라이넬리쉬 14년'),
  alcohol(13, '야마자키 12년'),
  alcohol(14, '라프로익 10년'),
  alcohol(15, 'E.H. 테일러 스몰 배치'),
];

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  // 책갈피 탭이 선택 탭으로 가로 스크롤한다. jsdom에는 없는 API다.
  Element.prototype.scrollTo = vi.fn();
  // 로그인 게이트 도달 측정용
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
    },
  );
  authState.isLoggedIn = false;
  useModalStore.setState((state) => ({
    loginState: { ...state.loginState, isShowLoginModal: false },
  }));
  vi.mocked(AlcoholsApi.getWeeklyViewPopular).mockResolvedValue({
    data: { alcohols: weeklyTop },
  } as never);
});

describe('홈 바로가기', () => {
  it('네 가지 바로가기가 각 화면으로 연결되고 누른 바로가기를 기록한다', () => {
    render(<HomeQuickLinks />);

    const nav = screen.getByRole('navigation', { name: '바로 가기' });
    const expected = [
      ['바텐더 노트', ROUTES.BARTENDER_NOTE],
      ['취향 테스트', ROUTES.WHISKEY_MBTI],
      ['위스키 타로', ROUTES.WHISKEY_TAROT],
      ['나의 기록', ROUTES.HISTORY.BASE],
    ];
    expected.forEach(([label, href]) => {
      expect(
        within(nav).getByRole('link', { name: new RegExp(label) }),
      ).toHaveAttribute('href', href);
    });

    fireEvent.click(within(nav).getByRole('link', { name: /바텐더 노트/ }));
    expect(trackGA4Event).toHaveBeenCalledWith('home_quick_link_click', {
      link: 'bartender_note',
    });
  });
});

describe('홈 주간 TOP 5', () => {
  it('운영 문구와 함께 1~5위를 순서대로 보여주고 선택한 위스키를 기록한다', async () => {
    renderWithQuery(<HomeFeaturedSection />);

    expect(await screen.findByText('주간 조회수 TOP 5')).toBeInTheDocument();
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(5);
    items.forEach((item, index) => {
      expect(item).toHaveTextContent(`0${index + 1}`);
      expect(item).toHaveTextContent(weeklyTop[index].korName);
    });

    const second = within(items[1]).getByRole('link', {
      name: /크라이넬리쉬 14년/,
    });
    expect(second).toHaveAttribute('href', ROUTES.ALCOHOL.DETAIL(12));
    fireEvent.click(second);
    expect(trackGA4Event).toHaveBeenCalledWith('home_item_click', {
      section: 'weekly_top',
      item_id: '12',
      position: 2,
    });
  });

  it('비로그인 상태에서 찜을 누르면 로그인 안내를 띄우고 찜 요청을 보내지 않는다', async () => {
    renderWithQuery(<HomeFeaturedSection />);

    const [first] = await screen.findAllByRole('button', { name: '찜하기' });
    fireEvent.click(first);

    expect(useModalStore.getState().loginState.isShowLoginModal).toBe(true);
    expect(AlcoholsApi.putPick).not.toHaveBeenCalled();
  });

  it('비로그인 상태로 최근에 본 위스키 탭을 열면 로그인 안내를 보여준다', async () => {
    renderWithQuery(<HomeFeaturedSection />);

    fireEvent.click(screen.getByRole('button', { name: '최근에 본 위스키' }));

    expect(
      await screen.findByText('로그인 후 확인 가능한 서비스 입니다.'),
    ).toBeInTheDocument();
    expect(AlcoholsApi.getHistory).not.toHaveBeenCalled();
  });
});
