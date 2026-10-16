import { render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import type { ExploreReview } from '@/api/explore/types';
import type { ReviewInDetails } from '@/api/alcohol/types';
import type { ReviewTastingProfile } from '@/api/review/types';
import ExploreReviewCard from '@/app/(primary)/explore/_components/ReviewListItem';
import AlcoholReviewCard from '@/app/(primary)/alcohols/[id]/_components/ReviewListItem';
import ReviewDetails from '@/app/(primary)/review/[id]/_components/ReviewDetails';
import type { ReviewDetailsWithoutAlcoholInfo } from '@/types/Review';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));
vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    <img alt={alt} src={src} />
  ),
}));
vi.mock('next/navigation', () => ({ useParams: () => ({ id: '7' }) }));
vi.mock('@/hooks/auth/useAuthSession', () => ({
  useAuthSession: () => ({ user: null, isLoggedIn: false }),
}));
vi.mock('@/store/modalStore', () => ({
  default: () => ({ handleLoginModal: vi.fn() }),
}));
vi.mock('@/store/relationshipsStore', () => ({
  default: () => ({ isUserBlocked: () => false }),
}));
vi.mock('@/hooks/useBlockActions', () => ({
  useBlockActions: () => ({ handleUnblockUser: vi.fn() }),
}));
vi.mock('@/app/(primary)/alcohols/[id]/_components/ReviewListUserInfo', () => ({
  default: () => <div>작성자</div>,
}));
vi.mock('@/app/(primary)/alcohols/[id]/_components/ReviewListActions', () => ({
  default: () => <div>리뷰 액션</div>,
}));
vi.mock('@/components/domain/review/ReviewActionDropdown', () => ({
  default: () => null,
}));
vi.mock('@/app/(primary)/review/[id]/_components/ReviewUserHeader', () => ({
  default: () => null,
}));
vi.mock('@/app/(primary)/review/[id]/_components/ReviewPriceLocation', () => ({
  default: () => null,
}));
vi.mock('@/app/(primary)/review/[id]/_components/ReviewInteractionBar', () => ({
  default: () => null,
}));
vi.mock('@/components/domain/alcohol/FlavorTags', () => ({
  default: () => null,
}));
vi.mock('@/components/ui/Display/SemanticIcon', () => ({
  default: () => null,
}));
vi.mock('@/components/domain/user/UserInfoDisplay', () => ({
  default: () => <div>작성자</div>,
}));
vi.mock('@/components/ui/Display/Star', () => ({
  default: () => <div>별점</div>,
}));
vi.mock('@/components/ui/Display/Label', () => ({ default: () => null }));
vi.mock('@/components/domain/review/ReplyButton', () => ({
  default: () => null,
}));
vi.mock('@/components/domain/review/ReviewLikeButton', () => ({
  default: () => null,
}));
// embla는 jsdom에서 matchMedia·레이아웃이 없어 초기화되지 않는다. 슬라이드 순서만 확인하므로 정지 상태 API로 대신한다.
vi.mock('embla-carousel-react', () => {
  // setApi로 상태에 들어가므로 렌더마다 같은 객체를 돌려준다.
  const api = {
    on: () => {},
    off: () => {},
    canScrollPrev: () => false,
    canScrollNext: () => true,
    selectedScrollSnap: () => 0,
    scrollPrev: () => {},
    scrollNext: () => {},
  };
  const ref = () => {};
  return { default: () => [ref, api] };
});

const profile: ReviewTastingProfile = {
  version: 2,
  maxScore: 10,
  axes: [
    { code: null, name: '바디감', description: '묵직함', score: 7 },
    { code: 'FRUITY', name: '과일', description: '배', score: 5 },
    { code: 'SWEET', name: '달콤함', description: null, score: 0 },
  ],
};

const oldGraph = 'https://example.com/tasting-graph/chart.png';
const photo = 'https://example.com/review/photo.png';
const userInfo = { userId: 1, nickName: '리뷰어', userProfileImage: '' };

const explore = {
  userInfo,
  reviewId: 11,
  alcoholId: 7,
  alcoholName: '위스키',
  reviewContent: '과일향',
  reviewImages: [oldGraph, photo],
  reviewTags: [],
  reviewRating: 4,
  isLikedByMe: false,
  likeCount: 0,
  replyCount: 0,
  hasReplyByMe: false,
  createAt: '2026-01-01',
  modifiedAt: '2026-01-01',
  totalImageCount: 2,
  isMyReview: false,
  isBestReview: false,
  tastingProfile: profile,
} satisfies ExploreReview;

const alcohol = {
  userInfo,
  reviewId: 11,
  reviewContent: '과일향',
  rating: 4,
  reviewImageUrl: oldGraph,
  sizeType: 'BOTTLE',
  price: 10000,
  isLikedByMe: false,
  likeCount: 0,
  replyCount: 0,
  hasReplyByMe: false,
  status: 'PUBLIC',
  isBestReview: false,
  isMyReview: false,
  createAt: '2026-01-01',
  tastingProfile: profile,
} as ReviewInDetails;

const renderDetails = ({
  tastingProfile,
  viewUrls,
}: {
  tastingProfile: ReviewTastingProfile | null;
  viewUrls: string[];
}) => {
  const data = {
    reviewInfo: {
      reviewId: 11,
      userInfo,
      reviewContent: '과일향',
      tastingProfile,
      tastingTagList: [],
      isLikedByMe: false,
      likeCount: 0,
      createAt: '2026-01-01',
    },
    reviewImageList: viewUrls.map((viewUrl, index) => ({
      order: index + 1,
      viewUrl,
    })),
  } as unknown as ReviewDetailsWithoutAlcoholInfo;

  render(
    <ReviewDetails
      data={data}
      alcoholId={7}
      handleLogin={vi.fn()}
      isPersonalizedReady={false}
      onRefresh={vi.fn()}
    />,
  );
};

describe('리뷰 목록 카드의 저장된 프로필 표시', () => {
  it('둘러보기: 그래프를 첫 장에 두고 과거 PNG만 제외하며 일반 사진은 유지한다', () => {
    render(<ExploreReviewCard content={explore} />);
    const slides = screen.getAllByRole('group');
    expect(slides).toHaveLength(2);
    expect(
      within(slides[0]).getByRole('img', { name: /바디감 7\/10/ }),
    ).toBeInTheDocument();
    expect(within(slides[1]).getByRole('img')).toHaveAttribute('src', photo);
    expect(document.querySelector(`img[src="${oldGraph}"]`)).toBeNull();
  });

  it('위스키 리뷰: 프로필을 즉시 그리고 예전 그래프 썸네일은 가린다', () => {
    render(<AlcoholReviewCard data={alcohol} onRefresh={vi.fn()} />);
    expect(screen.getByRole('img', { name: /과일 5\/10/ })).toBeInTheDocument();
    expect(screen.queryByAltText('content_img')).not.toBeInTheDocument();
  });

  it('프로필이 없는 과거 리뷰는 그래프 없이 기존 이미지가 남는다', () => {
    render(
      <AlcoholReviewCard
        data={{ ...alcohol, tastingProfile: null }}
        onRefresh={vi.fn()}
      />,
    );
    expect(
      screen.queryByRole('img', { name: /테이스팅 프로필/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByAltText('content_img')).toHaveAttribute('src', oldGraph);
  });

  it('상세: 그래프를 첫 장에 두고 이전 그래프 PNG는 사진에서 제외한다', () => {
    renderDetails({
      tastingProfile: profile,
      viewUrls: [oldGraph, photo],
    });

    const slides = screen.getAllByRole('group');
    expect(slides).toHaveLength(2);
    expect(
      within(slides[0]).getByRole('img', { name: /바디감 7\/10, 묵직함/ }),
    ).toBeInTheDocument();
    expect(
      within(slides[0])
        .getAllByTestId('tasting-score-badge')
        .map((n) => n.textContent),
    ).toContain('7');
    expect(within(slides[1]).getByRole('img')).toHaveAttribute('src', photo);
    expect(document.querySelector(`img[src="${oldGraph}"]`)).toBeNull();
  });

  it('상세: 사진 없이 프로필만 있으면 그래프 한 장만 보여준다', () => {
    renderDetails({ tastingProfile: profile, viewUrls: [] });

    const slides = screen.getAllByRole('group');
    expect(slides).toHaveLength(1);
    expect(
      within(slides[0]).getByRole('img', { name: /테이스팅 프로필/ }),
    ).toBeInTheDocument();
  });

  it('상세: 사진도 프로필도 없으면 슬라이드를 그리지 않는다', () => {
    renderDetails({ tastingProfile: null, viewUrls: [] });

    expect(screen.queryAllByRole('group')).toHaveLength(0);
    expect(screen.getByText('과일향')).toBeInTheDocument();
  });
});
