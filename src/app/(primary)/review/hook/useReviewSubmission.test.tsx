import { act, renderHook } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { ReviewApi } from '@/api/review/review.api';
import { uploadImages } from '@/utils/S3Upload';

import { useReviewSubmission } from './useReviewSubmission';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));
jest.mock('@/api/review/review.api', () => ({
  ReviewApi: { registerReview: jest.fn(), modifyReview: jest.fn() },
}));
jest.mock('@/api/rate/rate.api', () => ({
  RateApi: { postRating: jest.fn() },
}));
jest.mock('@/utils/S3Upload', () => ({ uploadImages: jest.fn() }));

jest.mock('@/utils/analytics/ga4', () => ({ trackGA4Event: jest.fn() }));

const profile = {
  version: 1,
  maxScore: 5,
  axes: [
    {
      code: 'SMOKY',
      name: '스모키',
      description: '연기 · 이탄 · 숯',
      score: 3,
    },
    {
      code: 'FRUITY',
      name: '과일',
      description: '사과 · 배 · 열대과일',
      score: 2,
    },
    {
      code: 'FLORAL',
      name: '꽃/허브',
      description: '장미 · 라벤더 · 풀',
      score: 0,
    },
    {
      code: 'SWEET',
      name: '달콤함',
      description: '바닐라 · 캐러멜 · 꿀',
      score: 4,
    },
    {
      code: 'SPICY',
      name: '향신료',
      description: '후추 · 시나몬 · 생강',
      score: 1,
    },
    { code: 'BODY', name: '바디감', description: '가벼움 ↔ 묵직함', score: 5 },
  ],
};

const form = {
  review: '시음 기록',
  status: 'PUBLIC',
  price_type: null,
  price: null,
  flavor_tags: [],
  rating: 4,
  tastingProfile: profile,
};

describe('리뷰 테이스팅 그래프 저장', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: jest.fn() });
    (ReviewApi.registerReview as jest.Mock).mockResolvedValue({
      data: { id: 12 },
    });
    (ReviewApi.modifyReview as jest.Mock).mockResolvedValue({
      data: { reviewId: 12 },
    });
  });

  it('작성한 여섯 축을 리뷰 요청에 저장한다', async () => {
    const { result } = renderHook(() =>
      useReviewSubmission({ alcoholId: '7', initialRating: 4 }),
    );

    await act(async () => {
      await result.current.submitReview(form);
    });

    expect(ReviewApi.registerReview).toHaveBeenCalledWith(
      expect.objectContaining({
        tastingProfile: profile,
      }),
    );
    expect(uploadImages).not.toHaveBeenCalled();
  });

  it('수정 화면에서 초기화하면 저장된 그래프와 차트 이미지를 함께 제거한다', async () => {
    const { result } = renderHook(() =>
      useReviewSubmission({ alcoholId: '7', reviewId: '12', initialRating: 4 }),
    );

    await act(async () => {
      await result.current.submitReview(
        {
          ...form,
          tastingProfile: {
            ...profile,
            axes: profile.axes.map((axis) => ({ ...axis, score: 0 })),
          },
        },
        [
          { order: 1, viewUrl: 'https://example.com/tasting-graph/chart.png' },
          { order: 2, viewUrl: 'https://example.com/review/photo.png' },
        ],
      );
    });

    expect(ReviewApi.modifyReview).toHaveBeenCalledWith(
      '12',
      expect.objectContaining({
        tastingProfile: null,
        imageUrlList: [
          { order: 2, viewUrl: 'https://example.com/review/photo.png' },
        ],
      }),
    );
  });

  it('사진 5장은 일반 리뷰 경로로만 업로드하고 수치 프로필은 보존한다', async () => {
    const photos = Array.from({ length: 5 }, (_, index) => ({
      order: index + 1,
      image: new File(['photo'], `photo-${index}.png`, { type: 'image/png' }),
    }));
    (uploadImages as jest.Mock).mockResolvedValue(
      photos.map(({ order }) => ({
        order,
        viewUrl: `https://example.com/review/${order}.png`,
      })),
    );
    const { result } = renderHook(() =>
      useReviewSubmission({ alcoholId: '7', initialRating: 4 }),
    );

    await act(async () => {
      await result.current.submitReview({ ...form, images: photos });
    });

    expect(uploadImages).toHaveBeenCalledTimes(1);
    expect(uploadImages).toHaveBeenCalledWith(
      'review',
      photos.map((photo) => photo.image),
    );
    expect(ReviewApi.registerReview).toHaveBeenCalledWith(
      expect.objectContaining({
        imageUrlList: expect.arrayContaining([
          { order: 5, viewUrl: 'https://example.com/review/5.png' },
        ]),
        tastingProfile: expect.objectContaining({ version: 1, maxScore: 5 }),
      }),
    );
  });

  it('사용자 정의 프로필은 리뷰 글만 수정해도 그대로 보존한다', async () => {
    const originalProfile = {
      version: 1,
      maxScore: 10,
      axes: [
        { code: null, name: '스모키', description: null, score: 7 },
        { code: null, name: '바닐라', description: null, score: 4 },
        { code: null, name: '바디감', description: null, score: 8 },
      ],
    };
    const { result } = renderHook(() =>
      useReviewSubmission({
        alcoholId: '7',
        reviewId: '12',
        initialRating: 4,
        initialTastingProfile: originalProfile,
      }),
    );

    await act(async () => {
      await result.current.submitReview({
        ...form,
        review: '글만 수정',
        tastingProfile: originalProfile,
      });
    });

    expect(ReviewApi.modifyReview).toHaveBeenCalledWith(
      '12',
      expect.objectContaining({ tastingProfile: originalProfile }),
    );
  });
});
