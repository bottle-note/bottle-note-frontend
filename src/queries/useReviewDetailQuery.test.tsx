import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { ReviewApi } from '@/api/review/review.api';
import type { ReviewDetailsResponse } from '@/api/review/types';
import { useReviewDetailQuery } from './useReviewDetailQuery';

const review: ReviewDetailsResponse = {
  alcoholInfo: {
    alcoholId: 482,
    korName: '스프링뱅크 10년',
    engName: 'Springbank 10yo',
    korCategory: '싱글 몰트',
    engCategory: 'Single Malt',
    imageUrl: '/bottle_note_meta.png',
    isPicked: false,
    rating: 3.8,
    totalRatingsCount: 16,
  },
  reviewInfo: {
    reviewId: 9001,
    reviewContent: '피트향과 과일향이 조화롭습니다.',
    price: 120000,
    sizeType: 'BOTTLE',
    likeCount: 2,
    replyCount: 0,
    reviewImageUrl: null,
    totalImageCount: 0,
    userInfo: { userId: 7, nickName: '시음가' },
    viewCount: 10,
    locationInfo: null,
    status: 'PUBLIC',
    isMyReview: false,
    isLikedByMe: false,
    hasReplyByMe: false,
    isBestReview: false,
    createAt: '2026-09-19T17:41:48',
    rating: 4,
  },
  reviewImageList: [],
};

function ReviewBody({
  enabled,
  viewerId,
  initialData,
}: {
  enabled: boolean;
  viewerId: number | null;
  initialData?: ReviewDetailsResponse;
}) {
  const { data } = useReviewDetailQuery({
    reviewId: '9001',
    enabled,
    viewerId,
    initialData,
  });

  return <p>{data?.reviewInfo.reviewContent ?? '리뷰 로딩 중'}</p>;
}

function response(data: ReviewDetailsResponse) {
  return {
    success: true,
    code: 200,
    data,
    errors: [],
    meta: {
      serverEncoding: 'UTF-8',
      serverVersion: 'test',
      serverPathVersion: 'v1',
      serverResponseTime: '2026-10-04T00:00:00Z',
    },
  };
}

describe('리뷰 상세 조회', () => {
  afterEach(() => jest.restoreAllMocks());

  it('공개 리뷰를 먼저 보여주고 로그인 상태가 확인되면 브라우저에서 다시 조회한다', async () => {
    const updated = {
      ...review,
      reviewInfo: { ...review.reviewInfo, reviewContent: '갱신된 공개 리뷰' },
    };
    const getReviewDetails = jest
      .spyOn(ReviewApi, 'getReviewDetails')
      .mockResolvedValue(response(updated));
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const view = (enabled: boolean) => (
      <QueryClientProvider client={queryClient}>
        <ReviewBody enabled={enabled} viewerId={7} initialData={review} />
      </QueryClientProvider>
    );

    const { rerender } = render(view(false));
    expect(
      screen.getByText(review.reviewInfo.reviewContent),
    ).toBeInTheDocument();
    expect(getReviewDetails).not.toHaveBeenCalled();

    rerender(view(true));
    expect(await screen.findByText('갱신된 공개 리뷰')).toBeInTheDocument();
    expect(getReviewDetails).toHaveBeenCalledTimes(1);
  });

  it('사용자가 바뀌면 이전 사용자의 비공개 리뷰 캐시를 표시하지 않는다', async () => {
    const privateReview = {
      ...review,
      reviewInfo: {
        ...review.reviewInfo,
        reviewContent: '작성자만 보는 비공개 리뷰',
        status: 'PRIVATE' as const,
      },
    };
    jest
      .spyOn(ReviewApi, 'getReviewDetails')
      .mockResolvedValue(response(privateReview));
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const view = (viewerId: number | null, enabled: boolean) => (
      <QueryClientProvider client={queryClient}>
        <ReviewBody enabled={enabled} viewerId={viewerId} />
      </QueryClientProvider>
    );

    const { rerender } = render(view(7, true));
    expect(
      await screen.findByText('작성자만 보는 비공개 리뷰'),
    ).toBeInTheDocument();

    rerender(view(null, false));
    await waitFor(() => {
      expect(screen.getByText('리뷰 로딩 중')).toBeInTheDocument();
    });
    expect(screen.queryByText('작성자만 보는 비공개 리뷰')).toBeNull();
  });
});
