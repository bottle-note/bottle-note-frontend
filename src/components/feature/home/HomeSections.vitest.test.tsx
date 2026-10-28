import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import type { Alcohol } from '@/api/alcohol/types';
import { ROUTES } from '@/constants/routes';
import useModalStore from '@/store/modalStore';
import { trackGA4Event } from '@/utils/analytics/ga4';
import HomeQuickLinks from './HomeQuickLinks';
import HomeFeaturedSection from './HomeFeaturedSection';
import HomeCurationSection from './HomeCurationSection';
import HomeReviewSection from './HomeReviewSection';
import { CurationV2Api } from '@/api/curation-v2/curation-v2.api';
import { ExploreApi } from '@/api/explore/explore.api';
import type { ExploreReview } from '@/api/explore/types';

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

vi.mock('@/api/curation-v2/curation-v2.api', () => ({
  CurationV2Api: { getFeed: vi.fn() },
}));
vi.mock('@/api/explore/explore.api', () => ({
  ExploreApi: { getReviews: vi.fn() },
}));

const curationItem = (id: number, name: string, payload: unknown) => ({
  id,
  name,
  description: `${name} 설명`,
  coverImageUrl: '',
  imageUrls: [],
  exposureStartDate: '2026-10-01',
  exposureEndDate: '2026-12-31',
  displayOrder: id,
  createAt: '2026-10-01',
  payload,
});

const review = (id: number, alcoholName: string): ExploreReview => ({
  userInfo: { userId: id, nickName: `작성자${id}`, userProfileImage: null },
  isMyReview: false,
  alcoholId: id,
  alcoholName,
  reviewId: id,
  reviewContent: `${alcoholName} 리뷰 본문`,
  reviewRating: 4.5,
  reviewTags: ['오크', '바닐라'],
  createAt: '2026-10-20',
  modifiedAt: '2026-10-20',
  totalImageCount: 0,
  reviewImages: [],
  isBestReview: false,
  likeCount: 3,
  isLikedByMe: false,
  replyCount: 0,
  hasReplyByMe: false,
});

const feedResponse = (items: unknown[]) => ({ data: { items } }) as never;

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

describe('홈 에디터 추천', () => {
  it('큐레이션·페어링·프로그램을 종류 배지와 함께 보여주고 선택과 전체 보기를 기록한다', async () => {
    vi.mocked(CurationV2Api.getFeed).mockResolvedValue(
      feedResponse([
        curationItem(1, '가을 위스키', [{ alcohol: { korName: 'A' } }]),
        curationItem(2, '치즈와 위스키', [{ pairings: [] }]),
        curationItem(3, '증류소 투어', {
          eventStartDate: '2026-11-01',
          eventEndDate: '2026-11-02',
          placeName: '서울',
        }),
      ]),
    );
    renderWithQuery(<HomeCurationSection />);

    expect(screen.getByText("EDITOR'S PICK")).toBeInTheDocument();
    const cards = await screen.findAllByRole('listitem');
    expect(cards.map((card) => card.textContent)).toEqual([
      expect.stringContaining('큐레이션가을 위스키'),
      expect.stringContaining('페어링치즈와 위스키'),
      expect.stringContaining('프로그램증류소 투어'),
    ]);
    expect(CurationV2Api.getFeed).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ['RECOMMENDED_WHISKY', 'WHISKY_PAIRING', 'PROGRAM'],
      }),
    );

    const pairing = within(cards[1]).getByRole('link');
    expect(pairing).toHaveAttribute('href', ROUTES.CURATION.DETAIL(2));
    fireEvent.click(pairing);
    expect(trackGA4Event).toHaveBeenCalledWith('home_item_click', {
      section: 'curation',
      item_id: '2',
      position: 2,
    });

    const more = screen.getByRole('link', { name: /전체 보기/ });
    expect(more).toHaveAttribute('href', ROUTES.CURATION.BASE);
    fireEvent.click(more);
    expect(trackGA4Event).toHaveBeenCalledWith('home_more_click', {
      section: 'curation',
    });
  });

  it('노출할 큐레이션이 없으면 섹션을 숨긴다', async () => {
    vi.mocked(CurationV2Api.getFeed).mockResolvedValue(feedResponse([]));
    renderWithQuery(<HomeCurationSection />);

    await waitFor(() => expect(CurationV2Api.getFeed).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.queryByText("EDITOR'S PICK")).not.toBeInTheDocument(),
    );
  });

  it('불러오지 못하면 다시 시도할 수 있다', async () => {
    vi.mocked(CurationV2Api.getFeed)
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce(
        feedResponse([curationItem(1, '가을 위스키', [])]),
      );
    renderWithQuery(<HomeCurationSection />);

    fireEvent.click(await screen.findByRole('button', { name: '다시 시도' }));

    expect(await screen.findByText('가을 위스키')).toBeInTheDocument();
  });
});

describe('홈 인기 리뷰', () => {
  it('인기순 리뷰 3개를 보여주고 리뷰 상세와 둘러보기 리뷰 탭으로 연결한다', async () => {
    vi.mocked(ExploreApi.getReviews).mockResolvedValue({
      data: {
        items: [
          review(31, '스프링뱅크 10년'),
          review(32, '라프로익 10년'),
          review(33, '야마자키 12년'),
        ],
      },
    } as never);
    renderWithQuery(<HomeReviewSection />);

    const items = await screen.findAllByRole('listitem');
    expect(screen.getByText('한 잔에 담긴 이야기')).toBeInTheDocument();
    expect(ExploreApi.getReviews).toHaveBeenCalledWith({
      sortType: 'POPULAR',
      sortOrder: 'DESC',
      size: 3,
    });
    expect(items).toHaveLength(3);

    const second = within(items[1]).getByRole('link');
    expect(second).toHaveAttribute('href', ROUTES.REVIEW.DETAIL(32));
    expect(second).toHaveTextContent('라프로익 10년 리뷰 본문');
    fireEvent.click(second);
    expect(trackGA4Event).toHaveBeenCalledWith('home_item_click', {
      section: 'review',
      item_id: '32',
      position: 2,
    });

    expect(screen.getByRole('link', { name: /리뷰 더 보기/ })).toHaveAttribute(
      'href',
      `${ROUTES.EXPLORE.BASE}?tab=REVIEW_WHISKEY`,
    );
  });

  it('리뷰가 없으면 섹션을 숨긴다', async () => {
    vi.mocked(ExploreApi.getReviews).mockResolvedValue({
      data: { items: [] },
    } as never);
    renderWithQuery(<HomeReviewSection />);

    await waitFor(() => expect(ExploreApi.getReviews).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.queryByText('한 잔에 담긴 이야기')).not.toBeInTheDocument(),
    );
  });
});
