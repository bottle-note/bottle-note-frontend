import {
  transformAlcohol,
  transformAlcoholList,
  transformCategories,
  transformRegions,
  toRegionOptions,
} from './transformers';
import type { AlcoholApiRaw, CategoryResponse, RegionResponse } from './types';

describe('transformAlcohol', () => {
  it('engCategoryName을 engCategory로 변환한다', () => {
    // Given
    const raw: AlcoholApiRaw = {
      alcoholId: 1,
      korName: '글렌피딕 12년',
      engName: 'Glenfiddich 12',
      rating: 4.5,
      ratingCount: 100,
      engCategoryName: 'SINGLE_MALT',
      korCategoryName: '싱글몰트',
      imageUrl: 'https://example.com/image.jpg',
      isPicked: true,
    };

    // When
    const result = transformAlcohol(raw);

    // Then
    expect(result.engCategory).toBe('SINGLE_MALT');
    expect(result.korCategory).toBe('싱글몰트');
    expect(result).not.toHaveProperty('engCategoryName');
    expect(result).not.toHaveProperty('korCategoryName');
  });

  it('기존 engCategory 필드가 있으면 그대로 사용한다', () => {
    // Given
    const raw: AlcoholApiRaw = {
      alcoholId: 1,
      korName: '글렌피딕 12년',
      engName: 'Glenfiddich 12',
      rating: 4.5,
      ratingCount: 100,
      engCategory: 'SINGLE_MALT',
      korCategory: '싱글몰트',
      imageUrl: 'https://example.com/image.jpg',
      isPicked: true,
    };

    // When
    const result = transformAlcohol(raw);

    // Then
    expect(result.engCategory).toBe('SINGLE_MALT');
    expect(result.korCategory).toBe('싱글몰트');
  });

  it('path를 올바르게 생성한다', () => {
    // Given
    const raw: AlcoholApiRaw = {
      alcoholId: 123,
      korName: '글렌피딕 12년',
      engName: 'Glenfiddich 12',
      rating: 4.5,
      ratingCount: 100,
      engCategory: 'SINGLE_MALT',
      korCategory: '싱글몰트',
      imageUrl: 'https://example.com/image.jpg',
      isPicked: true,
    };

    // When
    const result = transformAlcohol(raw);

    // Then
    expect(result.path).toBe('/search/SINGLE_MALT/123');
  });
});

describe('transformAlcoholList', () => {
  it('목록의 모든 항목을 변환한다', () => {
    // Given
    const rawList: AlcoholApiRaw[] = [
      {
        alcoholId: 1,
        korName: '글렌피딕 12년',
        engName: 'Glenfiddich 12',
        rating: 4.5,
        ratingCount: 100,
        engCategoryName: 'SINGLE_MALT',
        korCategoryName: '싱글몰트',
        imageUrl: 'https://example.com/1.jpg',
        isPicked: true,
      },
      {
        alcoholId: 2,
        korName: '잭다니엘',
        engName: 'Jack Daniels',
        rating: 4.0,
        ratingCount: 80,
        engCategoryName: 'BOURBON',
        korCategoryName: '버번',
        imageUrl: 'https://example.com/2.jpg',
        isPicked: false,
      },
    ];

    // When
    const result = transformAlcoholList(rawList);

    // Then
    expect(result).toHaveLength(2);
    expect(result[0].engCategory).toBe('SINGLE_MALT');
    expect(result[1].engCategory).toBe('BOURBON');
    expect(result[0].path).toBe('/search/SINGLE_MALT/1');
    expect(result[1].path).toBe('/search/BOURBON/2');
  });

  it('빈 배열을 올바르게 처리한다', () => {
    // Given
    const rawList: AlcoholApiRaw[] = [];

    // When
    const result = transformAlcoholList(rawList);

    // Then
    expect(result).toHaveLength(0);
  });
});

describe('transformCategories', () => {
  it('버번을 아메리칸(버번)으로 변환한다', () => {
    // Given
    const categories: CategoryResponse[] = [
      {
        korCategory: '싱글몰트',
        engCategory: 'SINGLE_MALT',
        categoryGroup: 'SINGLE_MALT',
      },
      { korCategory: '버번', engCategory: 'BOURBON', categoryGroup: 'BOURBON' },
    ];

    // When
    const result = transformCategories(categories);

    // Then
    const bourbon = result.find((c) => c.engCategory === 'BOURBON');
    expect(bourbon?.korCategory).toBe('아메리칸(버번)');
  });

  it('전체 옵션을 맨 앞에 추가한다', () => {
    // Given
    const categories: CategoryResponse[] = [
      {
        korCategory: '싱글몰트',
        engCategory: 'SINGLE_MALT',
        categoryGroup: 'SINGLE_MALT',
      },
    ];

    // When
    const result = transformCategories(categories);

    // Then
    expect(result[0]).toEqual({
      korCategory: '전체',
      engCategory: 'All',
      categoryGroup: '',
    });
    expect(result).toHaveLength(2);
  });
});

describe('transformRegions', () => {
  const ALL_SENTINEL: RegionResponse = {
    regionId: 0,
    korName: '국가(전체)',
    engName: 'All',
    description: '',
    parentId: null,
  };

  const makeRegion = (
    overrides: Partial<RegionResponse> & { regionId: number; korName: string },
  ): RegionResponse => ({
    engName: '',
    description: '',
    parentId: null,
    ...overrides,
  });

  it('국가(전체) 옵션을 맨 앞에 추가한다', () => {
    // Given
    const regions: RegionResponse[] = [
      makeRegion({ regionId: 1, korName: '스코틀랜드', engName: 'Scotland' }),
      makeRegion({ regionId: 2, korName: '아일랜드', engName: 'Ireland' }),
    ];

    // When
    const result = transformRegions(regions);

    // Then
    expect(result[0]).toEqual(ALL_SENTINEL);
    expect(result).toHaveLength(3);
  });

  it('지역 목록을 RegionResponse 형태로 유지한다', () => {
    // Given
    const region = makeRegion({
      regionId: 1,
      korName: '스코틀랜드',
      engName: 'Scotland',
    });

    // When
    const result = transformRegions([region]);

    // Then
    expect(result[1]).toEqual(region);
  });

  it('빈 배열이 들어오면 국가(전체)만 반환한다', () => {
    // When
    const result = transformRegions([]);

    // Then
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(ALL_SENTINEL);
  });

  it("korName에 '-'가 포함된 지역을 필터링한다", () => {
    // Given
    const regions: RegionResponse[] = [
      makeRegion({ regionId: 1, korName: '스코틀랜드' }),
      makeRegion({ regionId: 14, korName: '스코틀랜드-캠벨타운' }),
      makeRegion({ regionId: 15, korName: '스코틀랜드-아일라' }),
      makeRegion({ regionId: 7, korName: '일본' }),
    ];

    // When
    const result = transformRegions(regions);

    // Then: 국가(전체) + 스코틀랜드 + 일본 = 3
    expect(result).toHaveLength(3);
    expect(result.map((r) => r.korName)).toEqual([
      '국가(전체)',
      '스코틀랜드',
      '일본',
    ]);
  });

  it('원본 배열을 변경하지 않는다', () => {
    // Given
    const regions: RegionResponse[] = [
      makeRegion({ regionId: 1, korName: '스코틀랜드' }),
      makeRegion({ regionId: 2, korName: '아일랜드' }),
    ];
    const original = [...regions];

    // When
    transformRegions(regions);

    // Then
    expect(regions).toEqual(original);
  });
});

describe('toRegionOptions', () => {
  const makeRegion = (
    overrides: Partial<RegionResponse> & { regionId: number; korName: string },
  ): RegionResponse => ({
    engName: '',
    description: '',
    parentId: null,
    ...overrides,
  });

  it('"전체" 항목(regionId=0)의 type은 빈 문자열이다', () => {
    // Given
    const regions: RegionResponse[] = [
      makeRegion({ regionId: 0, korName: '국가(전체)' }),
    ];

    // When
    const options = toRegionOptions(regions);

    // Then
    expect(options[0]).toEqual({ type: '', name: '국가(전체)' });
  });

  it('지역 항목의 type은 숫자 문자열이다', () => {
    // Given
    const regions: RegionResponse[] = [
      makeRegion({ regionId: 7, korName: '일본' }),
    ];

    // When
    const options = toRegionOptions(regions);

    // Then
    expect(options[0]).toEqual({ type: '7', name: '일본' });
  });

  it('transformRegions 결과를 매핑하면 첫 번째는 type=""이고 나머지는 숫자 문자열이다', () => {
    // Given: transformRegions 결과
    const regions: RegionResponse[] = [
      makeRegion({ regionId: 0, korName: '국가(전체)' }),
      makeRegion({ regionId: 1, korName: '호주' }),
      makeRegion({ regionId: 7, korName: '일본' }),
    ];

    // When
    const options = toRegionOptions(regions);

    // Then
    expect(options[0].type).toBe('');
    expect(options[1].type).toBe('1');
    expect(options[2].type).toBe('7');
    expect(options.every((o) => typeof o.type === 'string')).toBe(true);
    expect(options.every((o) => typeof o.name === 'string')).toBe(true);
  });

  it('빈 배열이면 빈 배열을 반환한다', () => {
    expect(toRegionOptions([])).toEqual([]);
  });
});
