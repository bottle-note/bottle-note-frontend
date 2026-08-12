import { render, screen } from '@testing-library/react';
import type { ReviewInDetails } from '@/api/alcohol/types';
import type { AlcoholInfo } from '@/types/Alcohol';
import AlcoholDetailHeader from './AlcoholDetailHeader';
import FloatingReviewButton from './FloatingReviewButton';
import ReviewListItem from './ReviewListItem';

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: '274' }),
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/hooks/useNavigateReviewWrite', () => ({
  useNavigateReviewWrite: () => ({ handleReviewWrite: jest.fn() }),
}));

jest.mock('@/hooks/useScrollState', () => ({
  useScrollState: () => ({ isAtTop: true, isVisible: true }),
}));

jest.mock('@/hooks/auth/useAuthSession', () => ({
  useAuthSession: () => ({
    isLoggedIn: true,
    user: { userId: 1 },
  }),
}));

jest.mock('@/store/modalStore', () => ({
  __esModule: true,
  default: () => ({
    handleLoginModal: jest.fn(),
    handleModalState: jest.fn(),
  }),
}));

jest.mock('@/store/relationshipsStore', () => ({
  __esModule: true,
  default: () => ({ isUserBlocked: () => false }),
}));

jest.mock('@/hooks/useBlockActions', () => ({
  useBlockActions: () => ({ handleUnblockUser: jest.fn() }),
}));

jest.mock('@/components/domain/alcohol/AlcoholImage', () => ({
  __esModule: true,
  default: ({ bgColor }: { bgColor?: string }) => (
    <div data-bg-color={bgColor} data-testid="alcohol-image" />
  ),
}));

jest.mock('@/components/domain/alcohol/AlcoholPickButton', () => ({
  __esModule: true,
  default: ({ pickBtnName }: { pickBtnName?: string }) => (
    <button type="button">{pickBtnName}</button>
  ),
}));

jest.mock('./ReviewListActions', () => ({
  __esModule: true,
  default: () => <div>리뷰 액션</div>,
}));

jest.mock('@/components/domain/review/ReviewActionDropdown', () => ({
  __esModule: true,
  default: () => null,
}));

const alcohol: AlcoholInfo = {
  alcoholId: 274,
  alcoholUrlImg: 'https://example.com/whisky.jpg',
  korName: '글렌알라키 21년',
  engName: 'Glenallachie 21',
  korCategory: '싱글 몰트',
  engCategory: 'Single Malt',
  korRegion: '스코틀랜드',
  engRegion: 'Scotland',
  cask: 'Oak',
  abv: '51.1',
  korDistillery: '글렌알라키',
  engDistillery: 'Glenallachie',
  rating: 4.5,
  myAvgRating: 4,
  myRating: 4.5,
  totalRatingsCount: 10,
  isPicked: false,
  alcoholsTastingTags: [],
};

const review: ReviewInDetails = {
  reviewId: 1,
  reviewContent: '향과 맛의 균형이 좋은 위스키입니다.',
  price: 320000,
  sizeType: 'BOTTLE',
  likeCount: 2,
  replyCount: 1,
  reviewImageUrl: null,
  totalImageCount: 0,
  userInfo: {
    userId: 2,
    nickName: '테이스터',
    userProfileImage: null,
  },
  viewCount: 5,
  status: 'PUBLIC',
  isMyReview: false,
  isLikedByMe: false,
  hasReplyByMe: false,
  isBestReview: true,
  createAt: '2026-07-31',
  rating: 4.5,
};

describe('위스키 상세 시맨틱 색상', () => {
  it('브랜드 헤더는 배경 대비용 글자와 선 역할을 사용한다', () => {
    render(
      <AlcoholDetailHeader
        data={alcohol}
        isPicked={false}
        setIsPicked={jest.fn()}
      />,
    );

    const article = screen.getByRole('heading', {
      name: '글렌알라키 21년',
    }).parentElement?.parentElement;

    expect(article).toHaveClass('text-fg-brand-contrast');
    expect(screen.getByTestId('alcohol-image')).toHaveAttribute(
      'data-bg-color',
      'bg-palette-static-white',
    );
    expect(screen.getByRole('button', { name: '싱글 몰트' })).toHaveClass(
      'border-stroke-brand-contrast',
    );
    expect(
      screen
        .getByText('리뷰 작성')
        .parentElement?.querySelector(
          '[data-semantic-icon="/icon/edit-outlined-white.svg"]',
        ),
    ).toBeInTheDocument();
  });

  it('리뷰 목록은 본문·보조 글자·구분선을 중립 역할로 표시한다', () => {
    const { container } = render(
      <ReviewListItem data={review} onRefresh={jest.fn()} />,
    );

    expect(screen.getByText('향과 맛의 균형이 좋은 위스키입니다.')).toHaveClass(
      'text-fg-neutral',
    );
    expect(screen.getByText(/병 가격/)).toHaveClass('text-fg-neutral-muted');
    expect(screen.getByText('테이스터')).toHaveClass('text-fg-neutral-muted');
    expect(container.firstChild).toHaveClass('border-stroke-neutral-subtle');
    expect(
      container.querySelector('[data-semantic-icon="/bottle.svg"]'),
    ).toBeInTheDocument();
  });

  it('플로팅 리뷰 버튼은 브랜드 배경과 대비 글자 역할을 사용한다', () => {
    render(<FloatingReviewButton alcoholId="274" />);

    expect(screen.getByRole('button', { name: '리뷰작성' })).toHaveClass(
      'bg-bg-brand-solid',
      'text-fg-brand-contrast',
    );
    expect(
      screen
        .getByRole('button', { name: '리뷰작성' })
        .querySelector('[data-semantic-icon="/icon/plus-white.svg"]'),
    ).toBeInTheDocument();
  });
});
