import {
  transformAlcohol,
  transformAlcoholList,
  transformCategories,
  transformRegions,
} from './transformers';
import type { AlcoholApiRaw, CategoryResponse } from './types';

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
  it('국가(전체) 옵션을 맨 앞에 추가한다', () => {
    // Given
    const regions = [
      { regionId: 1, korName: '스코틀랜드' },
      { regionId: 2, korName: '아일랜드' },
    ];

    // When
    const result = transformRegions(regions);

    // Then
    expect(result[0]).toEqual({ id: -1, value: '국가(전체)' });
    expect(result).toHaveLength(3);
  });

  it('지역 목록을 id/value 형태로 변환한다', () => {
    // Given
    const regions = [{ regionId: 1, korName: '스코틀랜드' }];

    // When
    const result = transformRegions(regions);

    // Then
    expect(result[1]).toEqual({ id: 1, value: '스코틀랜드' });
  });
});
