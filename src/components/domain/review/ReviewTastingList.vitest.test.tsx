import { render, screen } from '@testing-library/react';
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
vi.mock('@/components/domain/review/ReviewImageCarousel', () => ({
  convertImageUrlsToProductImageArray: (urls: string[] | undefined) =>
    (urls ?? []).map((url) => ({ url })),
  ReviewImageCarousel: ({ images }: { images: { url: string }[] }) => (
    <div data-testid="review-photos">
      {images.map((image) => image.url).join(' | ')}
    </div>
  ),
}));

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

describe('리뷰 목록 카드의 저장된 프로필 표시', () => {
  it('둘러보기: 프로필을 즉시 그리고 과거 PNG만 제외하며 일반 사진은 유지한다', () => {
    render(<ExploreReviewCard content={explore} />);
    expect(
      screen.getByRole('img', { name: /바디감 7\/10/ }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('review-photos')).toHaveTextContent(photo);
    expect(screen.getByTestId('review-photos')).not.toHaveTextContent(oldGraph);
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

  it('상세: 저장된 축 설명을 보여주고 이전 그래프 PNG는 사진에서 제외한다', () => {
    const data = {
      reviewInfo: {
        reviewId: 11,
        userInfo,
        reviewContent: '과일향',
        tastingProfile: profile,
        tastingTagList: [],
        isLikedByMe: false,
        likeCount: 0,
        createAt: '2026-01-01',
      },
      reviewImageList: [
        { order: 1, viewUrl: oldGraph },
        { order: 2, viewUrl: photo },
      ],
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

    expect(
      screen.getByRole('img', { name: /바디감 7\/10, 묵직함/ }),
    ).toBeInTheDocument();
    expect(screen.getByText('바디감 7/10')).toBeInTheDocument();
    expect(screen.getByTestId('review-photos')).toHaveTextContent(photo);
    expect(screen.getByTestId('review-photos')).not.toHaveTextContent(oldGraph);
  });
});
