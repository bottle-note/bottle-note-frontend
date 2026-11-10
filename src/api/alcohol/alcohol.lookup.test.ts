import { apiClient } from '@/shared/api/apiClient';
import { AlcoholsApi } from './alcohol.api';

jest.mock('@/shared/api/apiClient', () => ({
  apiClient: { get: jest.fn() },
}));

const mockGet = apiClient.get as jest.Mock;

describe('AlcoholsApi.lookupPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('실제 응답의 data.items와 다음 페이지 cursor를 그대로 돌려준다', async () => {
    const item = { alcoholId: 1, korName: '글렌 테스트' };
    const controller = new AbortController();
    const response = {
      data: { items: [item] },
      errors: [],
      meta: { pagination: { hasNext: true, nextCursor: 'next' } },
    };
    mockGet.mockResolvedValue(response);

    await expect(
      AlcoholsApi.lookupPage({
        keyword: '글렌',
        cursor: 'prev',
        size: 20,
        signal: controller.signal,
      }),
    ).resolves.toEqual(response);
    expect(mockGet).toHaveBeenCalledWith(
      '/alcohols/lookup?keyword=%EA%B8%80%EB%A0%8C&cursor=prev&size=20',
      { authRequired: false, signal: controller.signal },
    );
  });

  it('목록 형태가 잘못된 응답은 화면에 전달하지 않는다', async () => {
    mockGet.mockResolvedValue({ data: [], errors: [] });

    await expect(
      AlcoholsApi.lookupPage({ keyword: '글렌', size: 20 }),
    ).rejects.toThrow();
  });
});
