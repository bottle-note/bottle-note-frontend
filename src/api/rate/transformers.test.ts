import { transformRateItem, transformRateList } from './transformers';
import type { RateApiRaw } from './types';

describe('transformRateItem', () => {
  it('카테고리명을 표준화된 형식으로 변환한다', () => {
    // Given
    const raw: RateApiRaw = {
      alcoholId: 1,
      korName: '글렌피딕 12년',
      engName: 'Glenfiddich 12',
      ratingCount: 100,
      engCategoryName: 'SCOTCH',
      korCategoryName: '스카치',
      imageUrl: 'https://example.com/image.jpg',
      isPicked: true,
      totalCount: 50,
    };

    // When
    const result = transformRateItem(raw);

    // Then
    expect(result.engCategory).toBe('SCOTCH');
    expect(result.korCategory).toBe('스카치');
    expect(result).not.toHaveProperty('engCategoryName');
    expect(result).not.toHaveProperty('korCategoryName');
    expect(result).not.toHaveProperty('totalCount');
  });
});

describe('transformRateList', () => {
  it('목록의 모든 항목을 변환한다', () => {
    // Given
    const rawList: RateApiRaw[] = [
      {
        alcoholId: 1,
        korName: '글렌피딕 12년',
        engName: 'Glenfiddich 12',
        ratingCount: 100,
        engCategoryName: 'SCOTCH',
        korCategoryName: '스카치',
        imageUrl: 'https://example.com/1.jpg',
        isPicked: true,
        totalCount: 50,
      },
      {
        alcoholId: 2,
        korName: '잭다니엘',
        engName: 'Jack Daniels',
        ratingCount: 80,
        engCategoryName: 'BOURBON',
        korCategoryName: '버번',
        imageUrl: 'https://example.com/2.jpg',
        isPicked: false,
        totalCount: 40,
      },
    ];

    // When
    const result = transformRateList(rawList);

    // Then
    expect(result).toHaveLength(2);
    expect(result[0].engCategory).toBe('SCOTCH');
    expect(result[1].engCategory).toBe('BOURBON');
  });

  it('빈 배열을 올바르게 처리한다', () => {
    // Given
    const rawList: RateApiRaw[] = [];

    // When
    const result = transformRateList(rawList);

    // Then
    expect(result).toHaveLength(0);
  });
});
