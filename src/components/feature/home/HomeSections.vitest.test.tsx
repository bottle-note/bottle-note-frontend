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
import HomeEditorPickSection from './HomeEditorPickSection';
import HomeReviewSection from './HomeReviewSection';
import HomeExploreSection from './HomeExploreSection';
import type { HomeEditorPick } from '@/app/(primary)/_utils/fetchHomeEditorPicks';
import type { CurationV2Payload } from '@/api/curation-v2/types';
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
    getRegion: vi.fn(),
  },
}));

vi.mock('@/api/explore/explore.api', () => ({
  ExploreApi: { getReviews: vi.fn() },
}));

const curationItem = (
  id: number,
  name: string,
  payload: CurationV2Payload,
) => ({
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
      ['위스키 검색', ROUTES.EXPLORE.WHISKEY_SEARCH_FOCUSED],
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
  it('책갈피 탭은 주간 TOP 5와 최근에 본 위스키만 보여준다', () => {
    renderWithQuery(<HomeFeaturedSection />);

    expect(
      screen.getByRole('button', { name: '주간 TOP 5' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '최근에 본 위스키' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '시음회' }),
    ).not.toBeInTheDocument();
  });

  it('탭 위 섹션 머리와 함께 1~5위를 순서대로 보여주고 선택한 위스키를 기록한다', async () => {
    renderWithQuery(<HomeFeaturedSection />);

    expect(screen.getByText('WEEKLY TOP 5')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: '이번 주 사람들이 가장 많이 본 위스키',
      }),
    ).toBeInTheDocument();
    const items = await screen.findAllByRole('listitem');
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

    // 탭을 바꾸면 탭 위 섹션 머리도 바뀐다.
    expect(screen.getByText('VIEW HISTORY')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '내가 최근 본 위스키' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('로그인 후 확인 가능한 서비스 입니다.'),
    ).toBeInTheDocument();
    expect(AlcoholsApi.getHistory).not.toHaveBeenCalled();
  });
});

describe('홈 에디터 추천', () => {
  const curations: HomeEditorPick[] = [
    { ...curationItem(4, '11월 시음회', {}), specCode: 'WHISKY_TASTING_EVENT' },
    { ...curationItem(3, '증류소 투어', {}), specCode: 'PROGRAM' },
    { ...curationItem(1, '가을 위스키', []), specCode: 'RECOMMENDED_WHISKY' },
    { ...curationItem(2, '치즈와 위스키', []), specCode: 'WHISKY_PAIRING' },
  ];

  it('서버에서 받은 순서대로 종류 배지와 함께 보여주고 선택과 전체 보기를 기록한다', () => {
    render(<HomeEditorPickSection editorPicks={curations} />);

    expect(screen.getByText("EDITOR'S PICK")).toBeInTheDocument();
    const cards = screen.getAllByRole('listitem');
    expect(cards.map((card) => card.textContent)).toEqual([
      expect.stringContaining('시음회11월 시음회'),
      expect.stringContaining('프로그램증류소 투어'),
      expect.stringContaining('큐레이션가을 위스키'),
      expect.stringContaining('페어링치즈와 위스키'),
    ]);

    const program = within(cards[1]).getByRole('link');
    expect(program).toHaveAttribute('href', ROUTES.CURATION.DETAIL(3));
    fireEvent.click(program);
    expect(trackGA4Event).toHaveBeenCalledWith('home_item_click', {
      section: 'curation',
      item_id: '3',
      position: 2,
    });

    const more = screen.getByRole('link', { name: /전체 보기/ });
    expect(more).toHaveAttribute('href', ROUTES.CURATION.BASE);
    fireEvent.click(more);
    expect(trackGA4Event).toHaveBeenCalledWith('home_more_click', {
      section: 'curation',
    });
  });

  it('노출할 큐레이션이 없으면 섹션을 숨긴다', () => {
    render(<HomeEditorPickSection editorPicks={[]} />);

    expect(screen.queryByText("EDITOR'S PICK")).not.toBeInTheDocument();
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

describe('홈 둘러보기(카테고리·국가별)', () => {
  beforeEach(() => {
    vi.mocked(AlcoholsApi.getRegion).mockResolvedValue({
      data: [
        {
          regionId: 1,
          korName: '스코틀랜드/전체',
          engName: 'Scotland',
          imageUrl: null,
          parentId: null,
          sortOrder: 1,
        },
        {
          regionId: 2,
          korName: '아일라',
          engName: 'Islay',
          imageUrl: null,
          parentId: 1,
          sortOrder: 2,
        },
        {
          regionId: 3,
          korName: '스페이사이드',
          engName: 'Speyside',
          imageUrl: null,
          parentId: 1,
          sortOrder: 3,
        },
        {
          regionId: 9,
          korName: '일본',
          engName: 'Japan',
          imageUrl: null,
          parentId: null,
          sortOrder: 9,
        },
      ],
    } as never);
  });

  it('카테고리를 목록으로 보여주고 선택한 카테고리 필터로 연결하며 기록한다', () => {
    renderWithQuery(<HomeExploreSection />);

    expect(screen.getByText('EXPLORE')).toBeInTheDocument();
    const singleMalt = screen.getByRole('link', { name: /싱글몰트/ });
    const href = new URL(
      singleMalt.getAttribute('href') ?? '',
      'http://localhost',
    );
    expect(href.pathname).toBe(ROUTES.EXPLORE.BASE);
    expect(href.searchParams.get('tab')).toBe('EXPLORER_WHISKEY');
    expect(href.searchParams.get('category')).toBeTruthy();

    fireEvent.click(singleMalt);
    expect(trackGA4Event).toHaveBeenCalledWith(
      'home_item_click',
      expect.objectContaining({ section: 'category', position: 1 }),
    );
  });

  it('국가별 보기에서 하위 지역이 있는 나라는 펼쳐 지역을 고르고, 없는 나라는 바로 이동한다', async () => {
    renderWithQuery(<HomeExploreSection />);

    fireEvent.click(screen.getByRole('button', { name: '국가별 보기' }));

    // 스코틀랜드는 처음부터 펼쳐져 있다.
    const scotland = await screen.findByRole('button', {
      name: '스코틀랜드 하위 지역 접기',
    });
    expect(scotland).toHaveAttribute('aria-expanded', 'true');
    const islay = screen.getByRole('link', { name: '아일라' });
    expect(islay.getAttribute('href')).toContain('regionIds=2');
    fireEvent.click(islay);
    expect(trackGA4Event).toHaveBeenCalledWith('home_item_click', {
      section: 'region',
      item_id: '2',
      position: 1,
    });

    expect(
      screen.getByRole('link', { name: /일본/ }).getAttribute('href'),
    ).toContain('regionIds=9');

    fireEvent.click(scotland);
    expect(
      screen.getByRole('button', { name: '스코틀랜드 하위 지역 펼치기' }),
    ).toHaveAttribute('aria-expanded', 'false');
  });
});
