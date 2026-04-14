import { AlcoholsApi } from './alcohol.api';

// apiClient를 모듈 레벨에서 mock
jest.mock('@/shared/api/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

import { apiClient } from '@/shared/api/apiClient';
const mockGet = apiClient.get as jest.Mock;

describe('AlcoholsApi.getRegion', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it('GET /regions를 호출하고 원본 데이터를 그대로 반환한다', async () => {
    // Given
    const apiResponse = {
      success: true,
      code: 200,
      data: [
        {
          regionId: 1,
          korName: '호주',
          engName: 'Australia',
          description: '호주 위스키',
        },
        {
          regionId: 7,
          korName: '일본',
          engName: 'Japan',
          description: '일본 위스키',
        },
      ],
      errors: [],
      meta: {},
    };
    mockGet.mockResolvedValueOnce(apiResponse);

    // When
    const result = await AlcoholsApi.getRegion();

    // Then: /regions 엔드포인트 호출 확인
    expect(mockGet).toHaveBeenCalledWith('/regions', { authRequired: false });

    // Then: API 응답 원본 그대로 반환 (변환은 useRegionsQuery에서 수행)
    expect(result.data).toHaveLength(2);
    expect(result.data[0].regionId).toBe(1);
    expect(result.data[0].korName).toBe('호주');
    expect(result.data[1].regionId).toBe(7);
    expect(result.data[1].korName).toBe('일본');
  });

  it('API 에러 시 에러를 throw한다', async () => {
    // Given
    const errorResponse = {
      success: false,
      code: 500,
      data: [],
      errors: [{ message: 'Internal Server Error' }],
      meta: {},
    };
    mockGet.mockResolvedValueOnce(errorResponse);

    // When & Then
    await expect(AlcoholsApi.getRegion()).rejects.toThrow();
  });

  it('빈 지역 목록이면 빈 배열을 반환한다', async () => {
    // Given
    const emptyResponse = {
      success: true,
      code: 200,
      data: [],
      errors: [],
      meta: {},
    };
    mockGet.mockResolvedValueOnce(emptyResponse);

    // When
    const result = await AlcoholsApi.getRegion();

    // Then
    expect(result.data).toHaveLength(0);
  });
});
