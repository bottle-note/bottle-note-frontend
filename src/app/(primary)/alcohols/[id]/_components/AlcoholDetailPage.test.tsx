import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import type {
  AlcoholDetailsResponse,
  ReviewInDetails,
} from '@/api/alcohol/types';
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
    alcoholsTastingTags: ['보리', '씨리얼'],
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

const renderPage = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
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
      <AlcoholDetailPage initialData={detail} />
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
});

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

  expect(screen.getByText('첫 번째 리뷰')).toBeInTheDocument();
  expect(screen.getByText('두 번째 리뷰')).toBeInTheDocument();
  expect(screen.queryByText('세 번째 리뷰')).not.toBeInTheDocument();

  fireEvent.click(screen.getByText('로그인하고 리뷰 16개 모두 보기'));
  expect(bridgeToLogin).toHaveBeenCalledWith({ trigger: 'comment' });
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
