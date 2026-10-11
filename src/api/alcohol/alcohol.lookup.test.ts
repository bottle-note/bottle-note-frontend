import { apiClient } from '@/shared/api/apiClient';
import { AlcoholsApi } from './alcohol.api';

jest.mock('@/shared/api/apiClient', () => ({
  apiClient: { get: jest.fn() },
}));

const mockGet = apiClient.get as jest.Mock;

describe('AlcoholsApi.lookup', () => {
  beforeEach(() => jest.clearAllMocks());

  it('실제 응답의 data.items를 검색 목록으로 반환한다', async () => {
    const item = { alcoholId: 1, korName: '글렌 테스트' };
    const controller = new AbortController();
    mockGet.mockResolvedValue({ data: { items: [item] }, errors: [] });

    await expect(
      AlcoholsApi.lookup('글렌', controller.signal),
    ).resolves.toEqual([item]);
    expect(mockGet).toHaveBeenCalledWith(
      '/alcohols/lookup?keyword=%EA%B8%80%EB%A0%8C&size=6',
      { authRequired: false, signal: controller.signal },
    );
  });

  it('목록 형태가 잘못된 응답은 화면에 전달하지 않는다', async () => {
    mockGet.mockResolvedValue({ data: [], errors: [] });

    await expect(AlcoholsApi.lookup('글렌')).rejects.toThrow();
  });
});
