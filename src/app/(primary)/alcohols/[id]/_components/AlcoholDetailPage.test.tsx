import { fireEvent, render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import type {
  AlcoholDetailsResponse,
  ReviewInDetails,
} from '@/api/alcohol/types';
import { ExploreApi } from '@/api/explore/explore.api';
import type { ExploreAlcohol } from '@/api/explore/types';
import { MfdsApi } from '@/api/mfds/mfds.api';
import { RateApi } from '@/api/rate/rate.api';
import { UserApi } from '@/api/user/user.api';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import AlcoholDetailPage from './AlcoholDetailPage';

const bridgeToLogin = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn(), replace: jest.fn() }),
  useParams: () => ({ id: '482' }),
  usePathname: () => '/alcohols/482',
  useSearchParams: () => new URLSearchParams(),
}));
jest.mock('@/hooks/auth/useAuthSession', () => ({
  useAuthSession: jest.fn(),
}));
jest.mock('@/hooks/useLoginBridge', () => ({
  useLoginBridge: () => ({ bridgeToLogin }),
}));
jest.mock('@/utils/analytics/ga4', () => ({
  trackGA4Event: jest.fn(),
}));

beforeAll(() => {
  window.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })) as unknown as typeof IntersectionObserver;
});

const review = (reviewId: number, reviewContent: string): ReviewInDetails => ({
  reviewId,
  reviewContent,
  price: 0,
  sizeType: 'GLASS',
  likeCount: 0,
  replyCount: 0,
  reviewImageUrl: null,
  totalImageCount: 0,
  userInfo: { userId: reviewId, nickName: `리뷰어${reviewId}` },
  viewCount: 0,
  status: 'PUBLIC',
  isMyReview: false,
  isLikedByMe: false,
  hasReplyByMe: false,
  isBestReview: false,
  createAt: '2026-09-19T17:41:48',
  rating: 4,
});

const detail: AlcoholDetailsResponse = {
  alcohols: {
    alcoholId: 482,
    alcoholUrlImg: '',
    description: '캠벨타운 특유의 개성을 균형 있게 보여주는 싱글몰트입니다.',
    korName: '스프링뱅크 10년',
    engName: 'Springbank 10yo',
    korCategory: '싱글 몰트',
    engCategory: 'Single Malt',
    korRegion: '스코틀랜드/캠벨타운',
    engRegion: 'Scotland/Campbeltown',
    cask: 'Ex-Bourbon Casks',
    abv: '46%',
    korDistillery: '스프링뱅크',
    engDistillery: 'Springbank',
    rating: 3.6,
    myAvgRating: 0,
    myRating: 0,
    totalRatingsCount: 19,
    isPicked: false,
    reviewCount: 16,
    alcoholsTastingTags: ['보리', '씨리얼', '시나몬'],
  },
  friendsInfo: { followerCount: 0, friends: [] },
  reviewInfo: {
    reviewList: [
      review(1, '첫 번째 리뷰'),
      review(2, '두 번째 리뷰'),
      review(3, '세 번째 리뷰'),
    ],
  },
};

const renderPage = ({
  isLoggedIn,
  initialData = detail,
}: {
  isLoggedIn: boolean;
  initialData?: AlcoholDetailsResponse;
}) => {
  jest.mocked(useAuthSession).mockReturnValue({
    isLoading: false,
    isLoggedIn,
    user: isLoggedIn ? { userId: 7 } : null,
  } as ReturnType<typeof useAuthSession>);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AlcoholDetailPage initialData={initialData} />
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  bridgeToLogin.mockClear();
  jest
    .spyOn(AlcoholsApi, 'getAlcoholDetails')
    .mockResolvedValue({ data: detail } as Awaited<
      ReturnType<typeof AlcoholsApi.getAlcoholDetails>
    >);
  jest.spyOn(MfdsApi, 'getAlcohols').mockResolvedValue({
    data: [] as unknown[],
  } as unknown as Awaited<ReturnType<typeof MfdsApi.getAlcohols>>);
  jest.spyOn(RateApi, 'getUserRating').mockResolvedValue({
    data: { rating: 0 },
  } as Awaited<ReturnType<typeof RateApi.getUserRating>>);
  jest.spyOn(UserApi, 'getCurUserInfo').mockResolvedValue({
    data: { nickname: '회원' },
  } as Awaited<ReturnType<typeof UserApi.getCurUserInfo>>);
  jest.spyOn(ExploreApi, 'getAlcohols').mockImplementation(
    async ({ keyword }) =>
      ({
        data: { items: similarByKeyword[keyword ?? ''] ?? [] },
      }) as unknown as Awaited<ReturnType<typeof ExploreApi.getAlcohols>>,
  );
});

const exploreAlcohol = (alcoholId: number, korName: string) =>
  ({
    alcoholId,
    korName,
    engName: korName,
    alcoholUrlImg: '',
    korCategory: '싱글 몰트',
    engCategory: 'Single Malt',
    rating: 3,
    totalRatingsCount: 1,
    isPicked: false,
  }) as ExploreAlcohol;

// 둘러보기 검색 결과에는 지금 보는 위스키도 섞여 온다
const similarByKeyword: Record<string, ExploreAlcohol[]> = {
  '보리 씨리얼': [
    exploreAlcohol(482, '스프링뱅크 10년'),
    exploreAlcohol(389, '카듀 12년'),
  ],
  '보리 시나몬': [exploreAlcohol(215, '글렌로시 10년')],
};

afterEach(() => {
  jest.restoreAllMocks();
});

it('비회원도 설명과 태그를 읽고, 리뷰 2개를 본 뒤 로그인해서 전체 리뷰로 이어간다', async () => {
  renderPage({ isLoggedIn: false });

  expect(
    await screen.findByText(
      '캠벨타운 특유의 개성을 균형 있게 보여주는 싱글몰트입니다.',
    ),
  ).toBeVisible();
  expect(screen.getByText('보리')).toBeVisible();
  expect(
    screen.queryByText('지금 보고 계신 위스키, 관심있으신가요?'),
  ).not.toBeInTheDocument();

  expect(await screen.findByText('첫 번째 리뷰')).toBeInTheDocument();
  expect(screen.getByText('두 번째 리뷰')).toBeInTheDocument();
  expect(screen.queryByText('세 번째 리뷰')).not.toBeInTheDocument();

  fireEvent.click(screen.getByText('로그인하고 리뷰 16개 모두 보기'));
  expect(bridgeToLogin).toHaveBeenCalledWith(
    { trigger: 'comment' },
    {
      returnTo: `/alcohols/482/reviews?name=${encodeURIComponent('스프링뱅크 10년').replace(/%20/g, '+')}`,
    },
  );
});

it('회원은 받은 리뷰를 모두 보고 리뷰 더 보기로 전체 리뷰로 간다', async () => {
  renderPage({ isLoggedIn: true });

  expect(await screen.findByText('세 번째 리뷰')).toBeInTheDocument();
  expect(screen.getByText('첫 번째 리뷰')).toBeInTheDocument();
  expect(screen.getByText('리뷰 더 보기')).toBeInTheDocument();
  expect(
    screen.queryByText('로그인하고 리뷰 16개 모두 보기'),
  ).not.toBeInTheDocument();
});

it('앞의 두 태그로 비슷한 위스키를 보여 주고, 태그를 바꾸면 그 태그가 모두 겹치는 위스키로 바꾼다', async () => {
  renderPage({ isLoggedIn: false });

  const similar = await screen.findByRole('region', {
    name: '비슷한 위스키 추천',
  });
  expect(await within(similar).findByText('카듀 12년')).toBeInTheDocument();
  expect(
    within(similar).queryByText('스프링뱅크 10년'),
  ).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '보리' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  // 세 번째 태그를 고르면 먼저 고른 태그가 빠져 두 개만 남는다
  fireEvent.click(screen.getByRole('button', { name: '씨리얼' }));
  fireEvent.click(screen.getByRole('button', { name: '시나몬' }));
  expect(await within(similar).findByText('글렌로시 10년')).toBeInTheDocument();
  expect(within(similar).queryByText('카듀 12년')).not.toBeInTheDocument();

  expect(
    within(similar).getByRole('link', { name: /더 보기/ }),
  ).toHaveAttribute(
    'href',
    `/explore?tab=EXPLORER_WHISKEY&keyword=${encodeURIComponent('보리 시나몬')}`,
  );
  const bartender = new URL(
    within(similar)
      .getByRole('link', { name: /바텐더 노트에게 다양한 위스키 추천받기/ })
      .getAttribute('href') ?? '',
    'http://localhost',
  );
  expect(bartender.pathname).toBe('/bartender-note');
  expect(Object.fromEntries(bartender.searchParams)).toEqual({
    from: 'similar',
    alcoholId: '482',
    name: '스프링뱅크 10년',
    tags: '보리,시나몬',
  });
});

it('고른 태그가 모두 겹치는 위스키가 없으면 안내 문구를 보여 준다', async () => {
  renderPage({ isLoggedIn: false });

  fireEvent.click(await screen.findByRole('button', { name: '보리' }));

  expect(
    await screen.findByText('고른 태그가 모두 겹치는 위스키가 없어요'),
  ).toBeInTheDocument();
});

it('서버 캐시에 남은 리뷰는 그리지 않고, 브라우저에서 새로 받은 리뷰만 보여 준다', async () => {
  renderPage({
    isLoggedIn: false,
    initialData: {
      ...detail,
      reviewInfo: { reviewList: [review(99, '지워진 리뷰')] },
    },
  });

  expect(screen.queryByText('지워진 리뷰')).not.toBeInTheDocument();
  expect(await screen.findByText('첫 번째 리뷰')).toBeInTheDocument();
  expect(screen.queryByText('지워진 리뷰')).not.toBeInTheDocument();
});
