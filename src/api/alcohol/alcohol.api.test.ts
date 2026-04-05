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

  it('GET /regions를 호출하고 transformRegions를 거쳐 반환한다', async () => {
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

    // Then: transformRegions가 "국가(전체)" 센티넬을 추가
    expect(result.data[0]).toEqual({
      regionId: 0,
      korName: '국가(전체)',
      engName: 'All',
      description: '',
      parentId: null,
    });

    // Then: 실제 데이터가 원본 형태로 유지됨
    expect(result.data[1].regionId).toBe(1);
    expect(result.data[1].korName).toBe('호주');
    expect(result.data[2].regionId).toBe(7);
    expect(result.data[2].korName).toBe('일본');
    expect(result.data).toHaveLength(3);
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

  it("korName에 '-'가 포함된 지역은 결과에서 제외된다", async () => {
    // Given
    const apiResponse = {
      success: true,
      code: 200,
      data: [
        {
          regionId: 14,
          korName: '스코틀랜드-캠벨타운',
          engName: 'Scotland-Campbeltown',
          description: '',
        },
        {
          regionId: 7,
          korName: '일본',
          engName: 'Japan',
          description: '',
        },
      ],
      errors: [],
      meta: {},
    };
    mockGet.mockResolvedValueOnce(apiResponse);

    // When
    const result = await AlcoholsApi.getRegion();

    // Then: 국가(전체) + 일본 = 2 (스코틀랜드-캠벨타운 제외)
    expect(result.data).toHaveLength(2);
    expect(result.data.map((r) => r.korName)).toEqual(['국가(전체)', '일본']);
  });

  it('빈 지역 목록이 와도 국가(전체) 센티넬은 포함된다', async () => {
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
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toEqual({
      regionId: 0,
      korName: '국가(전체)',
      engName: 'All',
      description: '',
      parentId: null,
    });
  });
});
