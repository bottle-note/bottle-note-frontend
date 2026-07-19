import { apiClient } from '@/shared/api/apiClient';
import { ExploreApi } from './explore.api';

jest.mock('@/shared/api/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

const mockGet = apiClient.get as jest.Mock;

describe('ExploreApi.getAlcohols', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({
      success: true,
      code: 200,
      data: { items: [] },
      errors: [],
      meta: {
        pageable: {
          currentCursor: 0,
          cursor: 0,
          pageSize: 10,
          hasNext: false,
        },
      },
    });
  });

  it('검색 요청의 AbortSignal을 apiClient까지 전달한다', async () => {
    const controller = new AbortController();

    await ExploreApi.getAlcohols({
      keywords: ['macallan'],
      sortType: 'POPULAR',
      sortOrder: 'DESC',
      cursor: 0,
      pageSize: 10,
      signal: controller.signal,
    });

    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining('/alcohols/explore/standard?'),
      {
        authRequired: false,
        signal: controller.signal,
      },
    );
  });
});
