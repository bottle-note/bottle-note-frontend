import { apiClient } from '@/shared/api/apiClient';
import { ExploreApi } from './explore.api';

jest.mock('@/shared/api/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

const mockGet = apiClient.get as jest.Mock;

const getSearchParams = () =>
  new URLSearchParams((mockGet.mock.calls[0][0] as string).split('?')[1]);

describe('ExploreApi.getAlcohols', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({
      success: true,
      code: 200,
      data: { items: [] },
      errors: [],
      meta: { pagination: { hasNext: false, nextCursor: null } },
    });
  });

  it('첫 요청은 cursor를 생략하고 size와 AbortSignal을 전달한다', async () => {
    const controller = new AbortController();

    await ExploreApi.getAlcohols({
      keywords: ['macallan'],
      sortType: 'POPULAR',
      sortOrder: 'DESC',
      size: 10,
      signal: controller.signal,
    } as never);

    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining('/alcohols/explore/standard?'),
      {
        authRequired: false,
        signal: controller.signal,
      },
    );
    expect(getSearchParams().get('cursor')).toBeNull();
    expect(getSearchParams().get('size')).toBe('10');
    expect(getSearchParams().has('pageSize')).toBe(false);
    expect(getSearchParams().has('ratingFrom')).toBe(false);
    expect(getSearchParams().has('ratingTo')).toBe(false);
  });

  it('다음 요청은 opaque cursor를 원문 그대로 전달한다', async () => {
    const cursor = 'eyJpZCI6MzcLCJzb3J0IjoiLz8rPSJ9';

    await ExploreApi.getAlcohols({
      keywords: ['macallan'],
      cursor,
      size: 10,
    } as never);

    expect(getSearchParams().get('cursor')).toBe(cursor);
  });

  it('선택 별점을 동일한 포함 상하한으로 전달한다', async () => {
    await ExploreApi.getAlcohols({
      keywords: [],
      ratingFrom: 4.5,
      ratingTo: 4.5,
      size: 10,
    } as never);

    expect(getSearchParams().get('ratingFrom')).toBe('4.5');
    expect(getSearchParams().get('ratingTo')).toBe('4.5');
  });
});

describe('ExploreApi.getReviews', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({
      success: true,
      code: 200,
      data: { items: [] },
      errors: [],
      meta: { pagination: { hasNext: false, nextCursor: null } },
    });
  });

  it('선택 작성 별점과 AbortSignal을 요청에 전달한다', async () => {
    const controller = new AbortController();

    await ExploreApi.getReviews({
      keywords: ['peaty'],
      ratingFrom: 3,
      ratingTo: 3,
      size: 10,
      signal: controller.signal,
    } as never);

    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining('/reviews/explore/standard?'),
      { authRequired: false, signal: controller.signal },
    );
    expect(getSearchParams().get('ratingFrom')).toBe('3');
    expect(getSearchParams().get('ratingTo')).toBe('3');
  });
});
